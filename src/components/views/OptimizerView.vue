<script setup>
import { computed, ref } from 'vue'
import { usePalettesStore } from '../../stores/palettes.js'
import OptimizerPanel from '../optimizer/OptimizerPanel.vue'
import OptimizerResult from '../optimizer/OptimizerResult.vue'

const store = usePalettesStore()
const palette = computed(() => store.activePalette())

const optimizedColors = ref(null)

function onResult(colors) {
  optimizedColors.value = colors
}

function apply() {
  if (palette.value && optimizedColors.value) {
    store.applyOptimizedColors(palette.value.id, optimizedColors.value)
    optimizedColors.value = null
  }
}

function discard() {
  optimizedColors.value = null
}
</script>

<template>
  <div class="flex-1 overflow-auto p-6">
    <div class="max-w-2xl space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Palette Optimizer</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Optimize the active palette
          <span class="font-medium text-gray-700 dark:text-gray-300">({{ palette?.name ?? 'none selected' }})</span>
          for perceptual distinctiveness or WCAG contrast.
        </p>
      </div>

      <!-- Before swatches -->
      <div v-if="palette?.colors.length" class="flex gap-2 flex-wrap">
        <div
          v-for="hex in palette.colors" :key="hex"
          class="w-12 h-12 rounded-lg shadow-sm"
          :style="{ background: hex }"
          :title="hex"
        />
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <OptimizerPanel :colors="palette?.colors ?? []" @result="onResult" />
      </div>

      <div v-if="optimizedColors" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Result</h3>
        <OptimizerResult
          :before="palette?.colors ?? []"
          :after="optimizedColors"
          @apply="apply"
          @discard="discard"
        />
      </div>
    </div>
  </div>
</template>
