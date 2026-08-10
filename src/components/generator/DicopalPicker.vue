<script setup>
import { ref, computed, watch } from 'vue'
import {
  listDicopalPalettes,
  getDicopalPalette,
  getDicopalColors,
  getDicopalAsymmetric,
  previewColors,
  providerLabel,
  DICOPAL_PROVIDERS,
  DICOPAL_TYPE_BY_GENERATOR,
} from '../../utils/dicopalHelpers.js'

const props = defineProps({
  type: { type: String, required: true },
  count: { type: Number, required: true },
})
const emit = defineEmits(['update:colors', 'update:range'])

const provider = ref('')
const search = ref('')
const cbfOnly = ref(false)
const reverse = ref(false)
const interpolate = ref(true)
const selected = ref('')

// Asymmetric diverging
const asymmetric = ref(false)
const classLeft = ref(3)
const classRight = ref(5)
const centralClass = ref(true)
const balanced = ref(false)

const dicopalType = computed(() => DICOPAL_TYPE_BY_GENERATOR[props.type])

const matches = computed(() => listDicopalPalettes({
  type: dicopalType.value,
  provider: provider.value || undefined,
  cbfOnly: cbfOnly.value,
  search: search.value,
}))

// Keep the selection valid whenever the filters change the candidate list.
watch(matches, (list) => {
  if (!list.some(p => p.key === selected.value)) {
    selected.value = list[0]?.key ?? ''
  }
}, { immediate: true })

const palette = computed(() => (selected.value ? getDicopalPalette(selected.value) : null))

const supportsInterpolation = computed(() => palette.value?.type === 'sequential')
const supportsAsymmetric = computed(() => palette.value?.type === 'diverging')

const result = computed(() => {
  if (!palette.value) return { colors: [], count: 0, exact: false, interpolated: false }
  if (asymmetric.value && supportsAsymmetric.value) {
    const colors = getDicopalAsymmetric(selected.value, classLeft.value, classRight.value, {
      centralClass: centralClass.value,
      balanced: balanced.value,
      reverse: reverse.value,
    })
    return { colors, count: colors.length, exact: true, interpolated: false }
  }
  return getDicopalColors(selected.value, props.count, {
    reverse: reverse.value,
    interpolate: interpolate.value && supportsInterpolation.value,
  })
})

// The count slider follows what the selected palette can actually produce.
const range = computed(() => {
  if (!palette.value) return null
  if (asymmetric.value && supportsAsymmetric.value) return null
  if (supportsInterpolation.value && interpolate.value) {
    return { min: 2, max: Math.max(20, palette.value.maxNumber) }
  }
  return { min: palette.value.minNumber, max: palette.value.maxNumber }
})

watch(result, (r) => emit('update:colors', r.colors), { immediate: true })
watch(range, (r) => emit('update:range', r), { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-3">
      <div class="flex-1">
        <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Provider</label>
        <select v-model="provider" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All providers</option>
          <option v-for="p in DICOPAL_PROVIDERS" :key="p" :value="p">{{ providerLabel(p) }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Search</label>
        <input
          v-model="search"
          type="text"
          placeholder="Filter by name…"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
        <input type="checkbox" v-model="cbfOnly" class="accent-indigo-600" />
        Colorblind-friendly only
      </label>
      <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
        <input type="checkbox" v-model="reverse" class="accent-indigo-600" />
        Reverse
      </label>
      <label v-if="supportsInterpolation" class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
        <input type="checkbox" v-model="interpolate" class="accent-indigo-600" />
        Interpolate to exact count
      </label>
      <label v-if="supportsAsymmetric" class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
        <input type="checkbox" v-model="asymmetric" class="accent-indigo-600" />
        Asymmetric
      </label>
    </div>

    <div>
      <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">
        Palette — <span class="text-gray-400 normal-case">{{ matches.length }} available</span>
      </label>
      <div v-if="!matches.length" class="text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg px-3 py-4 text-center">
        No palettes match these filters.
      </div>
      <div v-else class="max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
        <button
          v-for="p in matches"
          :key="p.key"
          @click="selected = p.key"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
            selected === p.key ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800',
          ]"
        >
          <span class="flex h-5 w-24 shrink-0 overflow-hidden rounded shadow-sm">
            <span
              v-for="(hex, i) in previewColors(p.key)"
              :key="i"
              class="flex-1"
              :style="{ background: hex }"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm text-gray-900 dark:text-white truncate">{{ p.name }}</span>
            <span class="block text-[11px] text-gray-400 truncate">
              {{ providerLabel(p.provider) }} · {{ p.minNumber }}–{{ p.maxNumber }} classes
            </span>
          </span>
          <span v-if="p.cbf" class="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">CBF</span>
        </button>
      </div>
    </div>

    <!-- Asymmetric diverging controls -->
    <template v-if="asymmetric && supportsAsymmetric">
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Left classes</label>
          <input type="number" v-model.number="classLeft" min="1" max="10" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div class="flex-1">
          <label class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1">Right classes</label>
          <input type="number" v-model.number="classRight" min="1" max="10" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
          <input type="checkbox" v-model="centralClass" class="accent-indigo-600" />
          Central class
        </label>
        <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
          <input type="checkbox" v-model="balanced" class="accent-indigo-600" />
          Balanced progression
        </label>
      </div>
    </template>

    <p v-if="palette" class="text-xs text-gray-500 dark:text-gray-400">
      <template v-if="result.interpolated">Interpolated to {{ result.count }} colors.</template>
      <template v-else-if="!result.exact">
        {{ palette.name }} has no {{ count }}-class variation — showing the closest ({{ result.count }}).
      </template>
      <template v-else>{{ result.count }} colors.</template>
      <a v-if="palette.url" :href="palette.url" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">Source ↗</a>
    </p>
  </div>
</template>
