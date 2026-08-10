<script setup>
const props = defineProps({
  activeTab: String,
})
const emit = defineEmits(['update:activeTab'])

const tabs = ['Palettes', 'Contrast', 'Generator', 'Optimizer', 'Converter']
</script>

<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
      <span class="font-semibold text-gray-900 dark:text-white tracking-tight shrink-0">Palette Builder</span>
      <nav class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="emit('update:activeTab', tab)"
          :class="[
            'px-3 py-1.5 rounded text-sm font-medium transition-colors',
            activeTab === tab
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
        >
          {{ tab }}
        </button>
      </nav>
    </div>
  </header>
</template>
