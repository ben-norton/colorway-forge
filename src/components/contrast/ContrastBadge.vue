<script setup>
defineProps({
  level: { type: String, required: true }, // 'AAA' | 'AA' | 'FAIL'
  small: { type: Boolean, default: false },
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded font-mono font-semibold',
      small ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
      level === 'AAA' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
      level === 'AA'  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    ]"
  >{{ level }}</span>
</template>
