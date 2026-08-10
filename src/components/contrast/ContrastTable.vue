<script setup>
import { computed } from 'vue'
import { contrastRatio, wcagLevel } from '../../utils/wcag.js'
import ContrastBadge from './ContrastBadge.vue'

const props = defineProps({
  colors: { type: Array, required: true },
})

const BG_TARGETS = [
  { label: 'vs White', hex: '#ffffff' },
  { label: 'vs Black', hex: '#000000' },
]

function cell(colorHex, bgHex) {
  const ratio = contrastRatio(colorHex, bgHex)
  return {
    ratio: ratio.toFixed(2),
    normal: wcagLevel(ratio, false),
    large: wcagLevel(ratio, true),
  }
}

function rowTint(colorHex) {
  let anyFail = false, allAaa = true
  for (const bg of BG_TARGETS) {
    const level = wcagLevel(contrastRatio(colorHex, bg.hex), false)
    if (level === 'FAIL') anyFail = true
    if (level !== 'AAA') allAaa = false
  }
  if (anyFail) return 'bg-red-50 dark:bg-red-900/10'
  if (allAaa) return 'bg-green-50 dark:bg-green-900/10'
  return 'bg-yellow-50 dark:bg-yellow-900/10'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="text-left py-2 px-3 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase w-40">Color</th>
          <th
            v-for="bg in BG_TARGETS" :key="bg.label"
            class="py-2 px-4 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase"
          >
            <div class="flex items-center gap-1.5">
              <span class="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block" :style="{ background: bg.hex }" />
              {{ bg.label }}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="hex in colors" :key="hex"
          :class="['border-b border-gray-100 dark:border-gray-800', rowTint(hex)]"
        >
          <td class="py-2 px-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded shadow-sm shrink-0" :style="{ background: hex }" />
              <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ hex }}</span>
            </div>
          </td>
          <td v-for="bg in BG_TARGETS" :key="bg.label" class="py-2 px-4">
            <template v-if="colors.length">
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ cell(hex, bg.hex).ratio }}:1</span>
                  <ContrastBadge :level="cell(hex, bg.hex).normal" />
                </div>
                <div class="flex items-center gap-1.5 opacity-60">
                  <span class="text-xs text-gray-400">large:</span>
                  <ContrastBadge :level="cell(hex, bg.hex).large" :small="true" />
                </div>
              </div>
            </template>
          </td>
        </tr>
        <tr v-if="!colors.length">
          <td :colspan="BG_TARGETS.length + 1" class="py-8 text-center text-gray-400 text-sm">
            Add colors to the active palette to test contrast
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
