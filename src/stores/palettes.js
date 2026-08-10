import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pb_palettes'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const usePalettesStore = defineStore('palettes', () => {
  const palettes = ref(load())
  const activePaletteId = ref(palettes.value[0]?.id ?? null)

  watch(palettes, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function createPalette(name = 'New Palette') {
    const palette = { id: uid(), name, colors: [], createdAt: Date.now() }
    palettes.value.push(palette)
    activePaletteId.value = palette.id
    return palette.id
  }

  function deletePalette(id) {
    const idx = palettes.value.findIndex(p => p.id === id)
    if (idx === -1) return
    palettes.value.splice(idx, 1)
    if (activePaletteId.value === id) {
      activePaletteId.value = palettes.value[0]?.id ?? null
    }
  }

  function renamePalette(id, name) {
    const p = palettes.value.find(p => p.id === id)
    if (p) p.name = name
  }

  function setActive(id) {
    activePaletteId.value = id
  }

  function activePalette() {
    return palettes.value.find(p => p.id === activePaletteId.value) ?? null
  }

  function addColor(paletteId, hex) {
    const p = palettes.value.find(p => p.id === paletteId)
    if (p) p.colors.push(hex.toLowerCase())
  }

  function updateColor(paletteId, index, hex) {
    const p = palettes.value.find(p => p.id === paletteId)
    if (p && index >= 0 && index < p.colors.length) {
      p.colors[index] = hex.toLowerCase()
    }
  }

  function removeColor(paletteId, index) {
    const p = palettes.value.find(p => p.id === paletteId)
    if (p) p.colors.splice(index, 1)
  }

  function importColors(paletteId, hexArray, replace = false) {
    const p = palettes.value.find(p => p.id === paletteId)
    if (!p) return
    const normalized = hexArray.map(h => h.toLowerCase())
    if (replace) {
      p.colors = normalized
    } else {
      p.colors.push(...normalized)
    }
  }

  function applyOptimizedColors(paletteId, hexArray) {
    const p = palettes.value.find(p => p.id === paletteId)
    if (p) p.colors = hexArray.map(h => h.toLowerCase())
  }

  return {
    palettes,
    activePaletteId,
    activePalette,
    createPalette,
    deletePalette,
    renamePalette,
    setActive,
    addColor,
    updateColor,
    removeColor,
    importColors,
    applyOptimizedColors,
  }
})
