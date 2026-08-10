<script setup>
import { ref, computed } from 'vue'
import { optimizePerceptual, optimizeWCAGContrast } from '../../utils/optimizer.js'

const props = defineProps({
  colors: { type: Array, required: true },
})
const emit = defineEmits(['result'])

const goal = ref('perceptual')
const bgPreset = ref('white')
const customBg = ref('#ffffff')
const running = ref(false)

const background = computed(() => {
  if (goal.value !== 'wcag') return null
  if (bgPreset.value === 'white') return '#ffffff'
  if (bgPreset.value === 'black') return '#000000'
  return customBg.value
})

async function run() {
  if (!props.colors.length) return
  running.value = true
  await new Promise(r => setTimeout(r, 10))
  try {
    let result
    if (goal.value === 'perceptual') {
      result = optimizePerceptual(props.colors)
    } else {
      result = optimizeWCAGContrast(props.colors, background.value)
    }
    emit('result', result)
  } finally {
    running.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-2">Optimization goal</label>
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="[val, label] in [['perceptual', 'Perceptual Distinctiveness'], ['wcag', 'WCAG Contrast']]"
          :key="val"
          @click="goal = val"
          :class="[
            'flex-1 py-1.5 rounded text-xs font-medium transition-colors',
            goal === val ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400',
          ]"
        >{{ label }}</button>
      </div>
    </div>

    <template v-if="goal === 'wcag'">
      <div class="space-y-2">
        <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block">Background</label>
        <div class="flex gap-2">
          <button
            v-for="[val, label] in [['white', 'White'], ['black', 'Black'], ['custom', 'Custom']]"
            :key="val"
            @click="bgPreset = val"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
              bgPreset === val ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300',
            ]"
          >{{ label }}</button>
        </div>
        <div v-if="bgPreset === 'custom'" class="flex items-center gap-2">
          <input type="color" v-model="customBg" class="h-9 w-16 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
          <span class="font-mono text-sm text-gray-600 dark:text-gray-400">{{ customBg }}</span>
        </div>
      </div>
    </template>

    <p v-if="!colors.length" class="text-sm text-gray-400">Select a palette with colors to optimize.</p>

    <button
      @click="run"
      :disabled="running || !colors.length"
      class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <svg v-if="running" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      {{ running ? 'Optimizing…' : 'Optimize' }}
    </button>
  </div>
</template>
