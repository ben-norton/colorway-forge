<script setup>
import { ref } from 'vue'
import { usePalettesStore } from '../../stores/palettes.js'

const store = usePalettesStore()
const newName = ref('')
const editingId = ref(null)
const editName = ref('')

function create() {
  const name = newName.value.trim() || 'New Palette'
  store.createPalette(name)
  newName.value = ''
}

function startRename(p) {
  editingId.value = p.id
  editName.value = p.name
}

function commitRename(id) {
  if (editName.value.trim()) store.renamePalette(id, editName.value.trim())
  editingId.value = null
}
</script>

<template>
  <aside class="w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex gap-1">
        <input
          v-model="newName"
          @keyup.enter="create"
          placeholder="Palette name"
          class="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button @click="create" class="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors">+</button>
      </div>
    </div>

    <ul class="flex-1 overflow-y-auto py-1">
      <li
        v-for="p in store.palettes"
        :key="p.id"
        @click="store.setActive(p.id)"
        :class="[
          'group flex items-center gap-2 px-3 py-2 cursor-pointer select-none text-sm',
          store.activePaletteId === p.id
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
        ]"
      >
        <!-- Color mini-preview -->
        <div class="flex gap-0.5 shrink-0">
          <div
            v-for="(c, i) in p.colors.slice(0, 5)" :key="i"
            class="w-2.5 h-5 rounded-sm"
            :style="{ background: c }"
          />
          <div v-if="!p.colors.length" class="w-5 h-5 rounded-sm border border-dashed border-gray-300 dark:border-gray-600" />
        </div>

        <!-- Name -->
        <template v-if="editingId === p.id">
          <input
            v-model="editName"
            @keyup.enter="commitRename(p.id)"
            @blur="commitRename(p.id)"
            @click.stop
            autofocus
            class="flex-1 min-w-0 border border-indigo-400 rounded px-1 py-0.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          />
        </template>
        <span v-else class="flex-1 truncate" @dblclick.stop="startRename(p)">{{ p.name }}</span>

        <button
          @click.stop="store.deletePalette(p.id)"
          class="hidden group-hover:flex text-gray-400 hover:text-red-500 transition-colors text-base leading-none"
          title="Delete"
        >×</button>
      </li>
    </ul>

    <div v-if="!store.palettes.length" class="flex-1 flex items-center justify-center text-xs text-gray-400 px-4 text-center">
      No palettes yet — create one above
    </div>
  </aside>
</template>
