import chroma from 'chroma-js'

export const BREWER_QUALITATIVE = [
  'Set1', 'Set2', 'Set3', 'Pastel1', 'Pastel2', 'Dark2', 'Accent', 'Paired',
]

export const BREWER_SEQUENTIAL = [
  'Blues', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds',
  'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd', 'RdPu',
  'YlGn', 'YlGnBu', 'YlOrBr', 'YlOrRd',
]

export const BREWER_DIVERGING = [
  'BrBG', 'PiYG', 'PRGn', 'PuOr', 'RdBu', 'RdGy', 'RdYlBu', 'RdYlGn', 'Spectral',
]

export function generateCategorical(count, options = {}) {
  const { scale = 'Set2', useCubehelix = false, cubehelixOptions = {} } = options
  if (useCubehelix) {
    const { start = 200, rotations = -0.5, hue = 1, gamma = 1, lightness = [0.3, 0.8] } = cubehelixOptions
    return chroma.cubehelix()
      .start(start)
      .rotations(rotations)
      .hue(hue)
      .gamma(gamma)
      .lightness(lightness)
      .scale()
      .correctLightness()
      .colors(count)
  }
  const brewerScale = chroma.brewer[scale] ?? chroma.brewer.Set2
  return chroma.scale(brewerScale).colors(count)
}

export function generateQuantitative(count, options = {}) {
  const { startColor = '#ffffff', endColor = '#0000ff', colorMode = 'lab' } = options
  return chroma.scale([startColor, endColor]).mode(colorMode).colors(count)
}

export function generateDiverging(count, options = {}) {
  const { leftColor = '#d73027', midColor = '#ffffbf', rightColor = '#1a9850', colorMode = 'lab' } = options
  const safeCount = count % 2 === 0 ? count + 1 : count
  return chroma.scale([leftColor, midColor, rightColor]).mode(colorMode).colors(safeCount)
}
