<script setup>
import { ref } from 'vue'
import { parseJsonColor, parseHexList } from '../../utils/colorConvert.js'

const emit = defineEmits(['import', 'close'])

const input = ref('')
const parsed = ref([])
const errCount = ref(0)
const parseError = ref('')
const detectedFormat = ref('')

function parseJsonInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr)) throw new Error('Expected a JSON array')
  const results = []
  let errs = 0
  for (const entry of arr) {
    const hex = parseJsonColor(entry)
    if (hex) results.push(hex)
    else errs++
  }
  return { colors: results, errs }
}

function parseInput() {
  parseError.value = ''
  parsed.value = []
  errCount.value = 0
  detectedFormat.value = ''

  const text = input.value.trim()
  if (!text) return

  // A leading bracket/brace means the paste is JSON; anything else is treated as
  // a plain separated list of colors.
  const looksLikeJson = text.startsWith('[') || text.startsWith('{')
  try {
    const { colors, errs } = looksLikeJson
      ? parseJsonInput(text)
      : (({ colors, invalid }) => ({ colors, errs: invalid.length }))(parseHexList(text))
    parsed.value = colors
    errCount.value = errs
    detectedFormat.value = looksLikeJson ? 'JSON' : 'hex list'
    if (!colors.length && !looksLikeJson) {
      parseError.value = 'No valid colors found — expected comma-separated hex codes.'
    }
  } catch (e) {
    parseError.value = e.message
  }
}

function handleFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    input.value = ev.target.result
    parseInput()
  }
  reader.readAsText(file)
}

function confirm() {
  if (parsed.value.length) {
    emit('import', parsed.value)
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="emit('close')">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[480px] p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Import Colors</h3>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400">
          Paste comma-separated hex codes —
          <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">#ff0000, #00ff00, 0000ff</code>
          — or a JSON array accepting <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">"#hex"</code>,
          <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">[r,g,b]</code>, or
          <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"r":0,"g":0,"b":0}</code>.
          The format is detected automatically.
        </p>

        <textarea
          v-model="input"
          @input="parseInput"
          rows="5"
          placeholder="#ff0000, #00ff00, #0000ff"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />

        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>or upload a file:</span>
          <input type="file" accept=".json,.txt,.csv" @change="handleFile" class="text-xs" />
        </div>

        <p v-if="parseError" class="text-xs text-red-500">{{ parseError }}</p>

        <div v-if="parsed.length" class="flex flex-wrap gap-1.5">
          <div
            v-for="(hex, i) in parsed" :key="i"
            class="w-6 h-6 rounded shadow"
            :style="{ background: hex }"
            :title="hex"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            <template v-if="parsed.length">
              {{ parsed.length }} color(s) ready<span v-if="errCount" class="text-red-500">, {{ errCount }} skipped</span>
              <span class="text-gray-400"> · detected {{ detectedFormat }}</span>
            </template>
          </span>
          <div class="flex gap-2">
            <button @click="emit('close')" class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              @click="confirm"
              :disabled="!parsed.length"
              class="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors"
            >Import {{ parsed.length || '' }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
