<script setup>
defineProps({
  before: { type: Array, required: true },
  after: { type: Array, required: true },
})
const emit = defineEmits(['apply', 'discard'])
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-2">Before</p>
        <div class="flex gap-1">
          <div
            v-for="hex in before" :key="hex"
            class="flex-1 h-12 rounded shadow-sm"
            :style="{ background: hex }"
            :title="hex"
          />
        </div>
      </div>
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-2">After</p>
        <div class="flex gap-1">
          <div
            v-for="hex in after" :key="hex"
            class="flex-1 h-12 rounded shadow-sm"
            :style="{ background: hex }"
            :title="hex"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-wrap gap-1">
        <span v-for="hex in before" :key="hex" class="font-mono text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">{{ hex }}</span>
      </div>
      <div class="flex flex-wrap gap-1">
        <span v-for="hex in after" :key="hex" class="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">{{ hex }}</span>
      </div>
    </div>

    <div class="flex gap-2 justify-end">
      <button @click="emit('discard')" class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Discard</button>
      <button @click="emit('apply')" class="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Apply to Palette</button>
    </div>
  </div>
</template>
