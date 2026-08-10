<script setup>
import { ref, watch, computed } from 'vue'
import chroma from 'chroma-js'
import { hexToRgb, rgbToHex, rgbToCmyk, cmykToRgb, normalizeToHex } from '../../utils/colorConvert.js'

const props = defineProps({
  modelValue: { type: String, default: '#000000' },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'close'])

const mode = ref('hex')
const hexInput = ref(props.modelValue)
const rgb = ref({ r: 0, g: 0, b: 0 })
const cmyk = ref({ c: 0, m: 0, y: 0, k: 0 })
const error = ref('')

function syncFromHex(hex) {
  if (!chroma.valid(hex)) return
  const h = chroma(hex).hex()
  hexInput.value = h
  rgb.value = hexToRgb(h)
  cmyk.value = rgbToCmyk(rgb.value)
  error.value = ''
}

watch(() => props.modelValue, (v) => syncFromHex(v), { immediate: true })
watch(() => props.show, (v) => { if (v) syncFromHex(props.modelValue) })

const preview = computed(() => {
  try { return chroma(hexInput.value).hex() } catch { return '#000000' }
})

function applyHex() {
  try {
    const h = normalizeToHex(hexInput.value, 'hex')
    emit('update:modelValue', h)
    error.value = ''
  } catch (e) {
    error.value = 'Invalid hex value'
  }
}

function applyRgb() {
  try {
    const h = normalizeToHex(rgb.value, 'rgb')
    syncFromHex(h)
    emit('update:modelValue', h)
  } catch (e) {
    error.value = 'Invalid RGB values'
  }
}

function applyCmyk() {
  try {
    const h = normalizeToHex(cmyk.value, 'cmyk')
    syncFromHex(h)
    emit('update:modelValue', h)
  } catch (e) {
    error.value = 'Invalid CMYK values'
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="emit('close')"
    >
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-80 p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Edit Color</h3>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        <!-- Preview -->
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-lg shadow border border-gray-200 dark:border-gray-700" :style="{ background: preview }" />
          <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ preview }}</span>
        </div>

        <!-- Mode tabs -->
        <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            v-for="m in ['hex', 'rgb', 'cmyk']"
            :key="m"
            @click="mode = m"
            :class="[
              'flex-1 py-1 rounded text-xs font-medium uppercase transition-colors',
              mode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400',
            ]"
          >{{ m }}</button>
        </div>

        <!-- HEX input -->
        <div v-if="mode === 'hex'" class="space-y-2">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Hex</label>
          <input
            v-model="hexInput"
            @input="applyHex"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="#rrggbb"
          />
        </div>

        <!-- RGB inputs -->
        <div v-if="mode === 'rgb'" class="space-y-2">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">RGB (0–255)</label>
          <div class="flex gap-2">
            <div v-for="ch in ['r', 'g', 'b']" :key="ch" class="flex-1">
              <label class="text-xs text-gray-400 uppercase">{{ ch }}</label>
              <input
                type="number" min="0" max="255"
                v-model.number="rgb[ch]"
                @change="applyRgb"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        <!-- CMYK inputs -->
        <div v-if="mode === 'cmyk'" class="space-y-2">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">CMYK (0–100)</label>
          <div class="flex gap-2">
            <div v-for="ch in ['c', 'm', 'y', 'k']" :key="ch" class="flex-1">
              <label class="text-xs text-gray-400 uppercase">{{ ch }}</label>
              <input
                type="number" min="0" max="100"
                v-model.number="cmyk[ch]"
                @change="applyCmyk"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <button
          @click="emit('close')"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 transition-colors"
        >Done</button>
      </div>
    </div>
  </Teleport>
</template>
