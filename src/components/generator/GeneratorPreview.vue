<script setup>
import { usePalettesStore } from '../../stores/palettes.js'

const props = defineProps({
  colors: { type: Array, default: () => [] },
})
const emit = defineEmits(['clear'])

const store = usePalettesStore()

function addToActive() {
  if (!store.activePaletteId) {
    store.createPalette('Generated')
  }
  store.importColors(store.activePaletteId, props.colors, false)
}

function saveAsNew() {
  const id = store.createPalette('Generated Palette')
  store.importColors(id, props.colors, false)
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="colors.length" class="flex gap-1 flex-wrap">
      <div
        v-for="hex in colors" :key="hex"
        class="flex-1 min-w-[32px] h-16 rounded shadow"
        :style="{ background: hex }"
        :title="hex"
      />
    </div>
    <div v-else class="h-16 rounded border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm text-gray-400">
      No preview yet
    </div>

    <div v-if="colors.length" class="flex flex-wrap gap-1">
      <span
        v-for="hex in colors" :key="hex"
        class="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded"
      >{{ hex }}</span>
    </div>

    <div v-if="colors.length" class="flex gap-2">
      <button
        @click="addToActive"
        class="flex-1 py-1.5 text-sm border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
      >Add to active palette</button>
      <button
        @click="saveAsNew"
        class="flex-1 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >Save as new palette</button>
    </div>
  </div>
</template>
