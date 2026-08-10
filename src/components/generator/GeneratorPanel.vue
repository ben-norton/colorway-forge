<script setup>
import { ref, computed, watch } from 'vue'
import {
  generateCategorical,
  generateQuantitative,
  generateDiverging,
  BREWER_QUALITATIVE,
  BREWER_SEQUENTIAL,
  BREWER_DIVERGING,
} from '../../utils/chromaHelpers.js'
import DicopalPicker from './DicopalPicker.vue'

const emit = defineEmits(['generated'])

const source = ref('chroma')
const type = ref('categorical')
const count = ref(6)

// Categorical
const catScale = ref('Set2')
const useCubehelix = computed(() => catScale.value === '__cubehelix')

// dicopal
const dicopalColors = ref([])
const dicopalRange = ref(null)

// Quantitative
const qStart = ref('#ffffff')
const qEnd = ref('#1e40af')
const qMode = ref('lab')

// Diverging
const dLeft = ref('#d73027')
const dMid = ref('#ffffbf')
const dRight = ref('#1a9850')
const dMode = ref('lab')

const minCount = computed(() => {
  if (source.value === 'dicopal') return dicopalRange.value?.min ?? 2
  return type.value === 'diverging' ? 5 : 3
})
const maxCount = computed(() => {
  if (source.value === 'dicopal') return dicopalRange.value?.max ?? 12
  return type.value === 'quantitative' ? 20 : type.value === 'diverging' ? 21 : 12
})

// The dicopal range depends on the selected palette, so pull the count back into
// bounds whenever that range shifts under it.
watch([minCount, maxCount], ([min, max]) => {
  count.value = Math.min(Math.max(count.value, min), max)
})

// Asymmetric diverging palettes size themselves; the slider doesn't apply there.
const showCount = computed(() => source.value !== 'dicopal' || dicopalRange.value !== null)

const colors = computed(() => {
  if (source.value === 'dicopal') return dicopalColors.value
  try {
    if (type.value === 'categorical') {
      return generateCategorical(count.value, { scale: catScale.value, useCubehelix: useCubehelix.value })
    }
    if (type.value === 'quantitative') {
      return generateQuantitative(count.value, { startColor: qStart.value, endColor: qEnd.value, colorMode: qMode.value })
    }
    if (type.value === 'diverging') {
      const c = count.value % 2 === 0 ? count.value + 1 : count.value
      return generateDiverging(c, { leftColor: dLeft.value, midColor: dMid.value, rightColor: dRight.value, colorMode: dMode.value })
    }
  } catch {
    return []
  }
  return []
})

const COLOR_MODES = ['rgb', 'lab', 'hsl', 'lch']

defineExpose({ colors })
</script>

<template>
  <div class="space-y-5">
    <!-- Source toggle -->
    <div>
      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-2">Source</label>
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="s in [{ id: 'chroma', label: 'chroma.js' }, { id: 'dicopal', label: 'dicopal library' }]"
          :key="s.id"
          @click="source = s.id"
          :class="[
            'flex-1 py-1.5 rounded text-xs font-medium transition-colors',
            source === s.id ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
        >{{ s.label }}</button>
      </div>
    </div>

    <!-- Type toggle -->
    <div>
      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-2">Palette type</label>
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="t in ['categorical', 'quantitative', 'diverging']"
          :key="t"
          @click="type = t"
          :class="[
            'flex-1 py-1.5 rounded text-xs font-medium capitalize transition-colors',
            type === t ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
        >{{ t }}</button>
      </div>
    </div>

    <!-- Count slider -->
    <div v-if="showCount">
      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">
        Count — <span class="text-indigo-600 font-semibold">{{ count }}</span>
      </label>
      <input type="range" v-model.number="count" :min="minCount" :max="maxCount" class="w-full accent-indigo-600" />
    </div>

    <!-- dicopal palette picker -->
    <DicopalPicker
      v-if="source === 'dicopal'"
      :type="type"
      :count="count"
      @update:colors="dicopalColors = $event"
      @update:range="dicopalRange = $event"
    />

    <!-- Categorical options -->
    <template v-if="source === 'chroma' && type === 'categorical'">
      <div>
        <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Scale</label>
        <select v-model="catScale" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option v-for="s in BREWER_QUALITATIVE" :key="s" :value="s">{{ s }}</option>
          <option value="__cubehelix">Cubehelix</option>
        </select>
      </div>
    </template>

    <!-- Quantitative options -->
    <template v-if="source === 'chroma' && type === 'quantitative'">
      <div class="flex gap-4">
        <div class="flex-1 space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Start color</label>
          <input type="color" v-model="qStart" class="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
        </div>
        <div class="flex-1 space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">End color</label>
          <input type="color" v-model="qEnd" class="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
        </div>
      </div>
      <div>
        <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Interpolation mode</label>
        <select v-model="qMode" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option v-for="m in COLOR_MODES" :key="m" :value="m">{{ m.toUpperCase() }}</option>
        </select>
      </div>
    </template>

    <!-- Diverging options -->
    <template v-if="source === 'chroma' && type === 'diverging'">
      <div class="flex gap-3">
        <div class="flex-1 space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Left</label>
          <input type="color" v-model="dLeft" class="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
        </div>
        <div class="flex-1 space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Mid</label>
          <input type="color" v-model="dMid" class="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
        </div>
        <div class="flex-1 space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Right</label>
          <input type="color" v-model="dRight" class="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
        </div>
      </div>
      <div>
        <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Interpolation mode</label>
        <select v-model="dMode" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option v-for="m in COLOR_MODES" :key="m" :value="m">{{ m.toUpperCase() }}</option>
        </select>
      </div>
    </template>

    <button
      @click="emit('generated', colors)"
      :disabled="!colors.length"
      class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
    >Generate</button>
  </div>
</template>
