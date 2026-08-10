<script setup>
import { ref, computed } from 'vue'
import { exportAsText, exportAsCSS, cssPreview } from '../../utils/fileExport.js'

const props = defineProps({
  colors: { type: Array, required: true },
  paletteName: { type: String, default: 'palette' },
})
const emit = defineEmits(['close'])

const format = ref('txt')
const prefix = ref('color')

const preview = computed(() => {
  if (format.value === 'txt') {
    return props.colors.slice(0, 5).join('\n') + (props.colors.length > 5 ? '\n...' : '')
  }
  return cssPreview(props.colors, prefix.value)
})

function doExport() {
  const safeName = props.paletteName.replace(/\s+/g, '-').toLowerCase()
  if (format.value === 'txt') {
    exportAsText(props.colors, `${safeName}.txt`)
  } else {
    exportAsCSS(props.colors, `${safeName}.css`, prefix.value)
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="emit('close')">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-96 p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Export Palette</h3>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        <div class="flex gap-4">
          <label v-for="f in [['txt', 'Text file (.txt)'], ['css', 'CSS variables (.css)']]" :key="f[0]" class="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
            <input type="radio" v-model="format" :value="f[0]" class="accent-indigo-600" />
            {{ f[1] }}
          </label>
        </div>

        <div v-if="format === 'css'" class="space-y-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Variable prefix</label>
          <input v-model="prefix" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="color" />
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p class="text-xs text-gray-400 mb-1 uppercase font-medium">Preview</p>
          <pre class="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ preview }}</pre>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="emit('close')" class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
          <button @click="doExport" class="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Download</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
