<script setup>
import { ref, computed } from 'vue'
import { usePalettesStore } from '../../stores/palettes.js'
import { normalizeToHex } from '../../utils/colorConvert.js'
import ColorSwatch from './ColorSwatch.vue'
import ColorEditor from './ColorEditor.vue'
import ImportModal from './ImportModal.vue'
import ExportModal from './ExportModal.vue'

const store = usePalettesStore()
const palette = computed(() => store.activePalette())

const editIndex = ref(null)
const editHex = ref('#000000')
const showColorEditor = ref(false)
const showImport = ref(false)
const showExport = ref(false)

function openEdit(index) {
  editIndex.value = index
  editHex.value = palette.value.colors[index]
  showColorEditor.value = true
}

function saveEdit(hex) {
  if (editIndex.value !== null) {
    store.updateColor(palette.value.id, editIndex.value, hex)
    editHex.value = hex
  }
}

function addColor() {
  store.addColor(palette.value.id, '#808080')
  const idx = palette.value.colors.length - 1
  openEdit(idx)
}

function onImport(hexArray) {
  store.importColors(palette.value.id, hexArray, false)
  showImport.value = false
}
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <template v-if="palette">
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="font-semibold text-gray-900 dark:text-white text-lg">{{ palette.name }}</h2>
        <span class="text-xs text-gray-400">{{ palette.colors.length }} color{{ palette.colors.length !== 1 ? 's' : '' }}</span>
        <div class="ml-auto flex gap-2">
          <button @click="showImport = true" class="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Import</button>
          <button @click="showExport = true" :disabled="!palette.colors.length" class="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">Export</button>
          <button @click="addColor" class="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">+ Add Color</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="palette.colors.length" class="flex flex-wrap gap-4">
          <ColorSwatch
            v-for="(hex, i) in palette.colors"
            :key="i"
            :hex="hex"
            :index="i"
            @edit="openEdit"
            @remove="store.removeColor(palette.id, $event)"
          />
        </div>
        <div v-else class="flex flex-col items-center justify-center h-48 text-gray-400 text-sm gap-2">
          <span>No colors yet</span>
          <button @click="addColor" class="text-indigo-600 hover:underline">Add your first color</button>
        </div>
      </div>
    </template>

    <div v-else class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      Select or create a palette
    </div>

    <ColorEditor
      v-if="showColorEditor"
      v-model="editHex"
      :show="showColorEditor"
      @update:model-value="saveEdit"
      @close="showColorEditor = false; editIndex = null"
    />
    <ImportModal v-if="showImport" @import="onImport" @close="showImport = false" />
    <ExportModal
      v-if="showExport && palette"
      :colors="palette.colors"
      :palette-name="palette.name"
      @close="showExport = false"
    />
  </div>
</template>
