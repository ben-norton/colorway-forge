<script setup>
import { ref } from 'vue'
import GeneratorPanel from '../generator/GeneratorPanel.vue'
import GeneratorPreview from '../generator/GeneratorPreview.vue'

const generatedColors = ref([])

function onGenerated(colors) {
  generatedColors.value = colors
}
</script>

<template>
  <div class="flex-1 overflow-auto p-6">
    <div class="max-w-2xl space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Palette Generator</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Generate categorical, quantitative, or diverging color palettes with chroma.js, or pick from 180+ curated scientific and cartographic palettes via dicopal.</p>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <GeneratorPanel @generated="onGenerated" />
      </div>

      <div v-if="generatedColors.length" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Preview</h3>
        <GeneratorPreview :colors="generatedColors" />
      </div>
    </div>
  </div>
</template>
