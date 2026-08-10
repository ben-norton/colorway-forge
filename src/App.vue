<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import PalettesView from './components/views/PalettesView.vue'
import ContrastView from './components/views/ContrastView.vue'
import GeneratorView from './components/views/GeneratorView.vue'
import OptimizerView from './components/views/OptimizerView.vue'
import ConverterView from './components/views/ConverterView.vue'

const activeTab = ref('Palettes')

const views = {
  Palettes: PalettesView,
  Contrast: ContrastView,
  Generator: GeneratorView,
  Optimizer: OptimizerView,
  Converter: ConverterView,
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
    <AppHeader :active-tab="activeTab" @update:active-tab="activeTab = $event" />
    <main class="flex flex-1 overflow-hidden">
      <component :is="views[activeTab]" />
    </main>
  </div>
</template>
