<script setup>
import { computed } from 'vue'
import { usePalettesStore } from '../../stores/palettes.js'
import ContrastTable from '../contrast/ContrastTable.vue'

const store = usePalettesStore()
const palette = computed(() => store.activePalette())
</script>

<template>
  <div class="flex-1 overflow-auto p-6">
    <div class="max-w-3xl">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">WCAG Contrast Check</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Each color from
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ palette?.name ?? 'the active palette' }}</span>
          tested against white and black backgrounds.
        </p>
      </div>

      <div class="mb-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700"></span>
          AAA (≥7:1 normal, ≥4.5:1 large)
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700"></span>
          AA (≥4.5:1 normal, ≥3:1 large)
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700"></span>
          FAIL
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ContrastTable :colors="palette?.colors ?? []" />
      </div>
    </div>
  </div>
</template>
