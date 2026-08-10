<script setup>
defineProps({
  hex: { type: String, required: true },
  index: { type: Number, required: true },
})
const emit = defineEmits(['edit', 'remove'])
</script>

<template>
  <div class="group relative flex flex-col items-center gap-1 w-20">
    <div
      class="w-16 h-16 rounded-lg shadow cursor-pointer ring-2 ring-transparent hover:ring-indigo-400 transition-all"
      :style="{ background: hex }"
      @click="emit('edit', index)"
      :title="`Edit ${hex}`"
    />
    <span class="text-xs font-mono text-gray-600 dark:text-gray-400 leading-none">{{ hex }}</span>
    <button
      @click.stop="emit('remove', index)"
      class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs items-center justify-center hidden group-hover:flex leading-none"
      title="Remove"
    >×</button>
  </div>
</template>
