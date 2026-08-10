<script setup>
import { ref, computed } from 'vue'
import { hexToRgb, rgbToHex } from '../../utils/colorConvert.js'
import { usePalettesStore } from '../../stores/palettes.js'
import chroma from 'chroma-js'

const store = usePalettesStore()

const direction = ref('hex-to-rgb')
const inputText = ref('')
const outputText = ref('')
const errorLines = ref([])
const copied = ref(false)

function parseRgbLine(line) {
  const clean = line.trim().replace(/^rgb\(/i, '').replace(/\)$/, '')
  const parts = clean.split(/[\s,]+/).map(Number)
  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
    return { r: parts[0], g: parts[1], b: parts[2] }
  }
  return null
}

function convert() {
  errorLines.value = []
  const lines = inputText.value.split('\n').map(l => l.trim()).filter(Boolean)
  const results = []

  for (const line of lines) {
    try {
      if (direction.value === 'hex-to-rgb') {
        const h = line.startsWith('#') ? line : '#' + line
        if (!chroma.valid(h)) { errorLines.value.push(line); continue }
        const { r, g, b } = hexToRgb(h)
        results.push(`rgb(${r}, ${g}, ${b})`)
      } else {
        const rgb = parseRgbLine(line)
        if (!rgb) { errorLines.value.push(line); continue }
        results.push(rgbToHex(rgb))
      }
    } catch {
      errorLines.value.push(line)
    }
  }
  outputText.value = results.join('\n')
}

async function copyAll() {
  if (!outputText.value) return
  await navigator.clipboard.writeText(outputText.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function loadIntoActive() {
  const hexLines = outputText.value.split('\n').map(l => l.trim()).filter(l => chroma.valid(l))
  if (!hexLines.length) return
  if (!store.activePaletteId) store.createPalette('Converted')
  store.importColors(store.activePaletteId, hexLines, false)
}

const canLoadIntoActive = computed(() => {
  if (!outputText.value) return false
  return outputText.value.split('\n').some(l => chroma.valid(l.trim()))
})

const placeholder = computed(() =>
  direction.value === 'hex-to-rgb'
    ? '#ff0000\n#00ff00\n00ff00'
    : 'rgb(255, 0, 0)\n0, 255, 0\n0 0 255'
)
</script>

<template>
  <div class="flex-1 overflow-auto p-6">
    <div class="max-w-2xl space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Batch Color Converter</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Convert between HEX and RGB in bulk — one value per line.</p>
      </div>

      <!-- Direction toggle -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          v-for="[val, label] in [['hex-to-rgb', 'HEX → RGB'], ['rgb-to-hex', 'RGB → HEX']]"
          :key="val"
          @click="direction = val; outputText = ''; errorLines = []"
          :class="[
            'px-4 py-1.5 rounded text-sm font-medium transition-colors',
            direction === val ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400',
          ]"
        >{{ label }}</button>
      </div>

      <!-- Input/output row -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Input</label>
          <textarea
            v-model="inputText"
            :placeholder="placeholder"
            rows="12"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Output</label>
          <textarea
            :value="outputText"
            readonly
            rows="12"
            placeholder="Results will appear here"
            class="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 font-mono text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:outline-none resize-none"
          />
        </div>
      </div>

      <div v-if="errorLines.length" class="text-xs text-red-500">
        Skipped {{ errorLines.length }} unrecognized line(s): {{ errorLines.join(', ') }}
      </div>

      <!-- Actions -->
      <div class="flex gap-2 flex-wrap">
        <button
          @click="convert"
          :disabled="!inputText.trim()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >Convert</button>
        <button
          @click="copyAll"
          :disabled="!outputText"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 text-sm font-medium rounded-lg transition-colors"
        >{{ copied ? 'Copied!' : 'Copy All' }}</button>
        <button
          @click="loadIntoActive"
          :disabled="!canLoadIntoActive"
          class="px-4 py-2 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-40 text-sm font-medium rounded-lg transition-colors"
        >Load into active palette</button>
      </div>

      <p class="text-xs text-gray-400">
        <template v-if="direction === 'hex-to-rgb'">
          Input: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">#rrggbb</code> or <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">rrggbb</code>
        </template>
        <template v-else>
          Input: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">rgb(r, g, b)</code> or <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">r, g, b</code> or <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">r g b</code>
        </template>
      </p>
    </div>
  </div>
</template>
