import {
  getPalettes,
  getSequentialColors,
  getAsymmetricDivergingColors,
} from 'dicopal'

// dicopal groups palettes by type; the generator uses its own vocabulary for the
// same three families, so keep a translation table in one place.
export const DICOPAL_TYPE_BY_GENERATOR = {
  categorical: 'qualitative',
  quantitative: 'sequential',
  diverging: 'diverging',
}

export const PROVIDER_LABELS = {
  cartocolors: 'CARTOColors',
  cmocean: 'cmocean',
  colorbrewer: 'ColorBrewer',
  lightbartlein: 'Light & Bartlein',
  matplotlib: 'Matplotlib',
  mycarta: 'MyCarta',
  scientific: 'Scientific (Crameri)',
  tableau: 'Tableau',
  wesanderson: 'Wes Anderson',
  okabeito: 'Okabe & Ito',
  joshuastevens: 'Joshua Stevens',
  d3: 'D3 / Observable',
}

// dicopal exposes each palette once per class count (1677 entries). Collapse those
// into one record per palette, keyed by provider + name because 'Gray' exists in
// two providers with different types.
function buildIndex() {
  const map = new Map()
  for (const p of getPalettes()) {
    const key = `${p.provider}/${p.name}`
    let entry = map.get(key)
    if (!entry) {
      entry = {
        key,
        name: p.name,
        provider: p.provider,
        type: p.type,
        url: p.url,
        numbers: [],
        cbfNumbers: new Set(),
        variants: new Map(),
      }
      map.set(key, entry)
    }
    entry.numbers.push(p.number)
    entry.variants.set(p.number, p.colors)
    if (p.cbf) entry.cbfNumbers.add(p.number)
  }
  for (const entry of map.values()) {
    entry.numbers.sort((a, b) => a - b)
    entry.minNumber = entry.numbers[0]
    entry.maxNumber = entry.numbers[entry.numbers.length - 1]
    // Colorblind-friendliness is reported per class count; flag the palette when
    // every variation qualifies so the filter never promises more than it delivers.
    entry.cbf = entry.cbfNumbers.size === entry.numbers.length
  }
  return map
}

const INDEX = buildIndex()

export const DICOPAL_PALETTES = [...INDEX.values()].sort(
  (a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name),
)

export const DICOPAL_PROVIDERS = [...new Set(DICOPAL_PALETTES.map(p => p.provider))].sort()

export function providerLabel(provider) {
  return PROVIDER_LABELS[provider] ?? provider
}

export function getDicopalPalette(key) {
  return INDEX.get(key) ?? null
}

export function listDicopalPalettes({ type, provider, cbfOnly = false, search = '' } = {}) {
  const needle = search.trim().toLowerCase()
  return DICOPAL_PALETTES.filter((p) => {
    if (type && p.type !== type) return false
    if (provider && p.provider !== provider) return false
    if (cbfOnly && !p.cbf) return false
    if (needle && !p.name.toLowerCase().includes(needle)) return false
    return true
  })
}

/**
 * Resolve the colors of a dicopal palette at a requested class count.
 *
 * Palettes only ship a fixed set of class counts. Sequential palettes can be
 * interpolated to any count; the rest fall back to the closest available count,
 * which is reported back so the UI can say what actually happened.
 */
export function getDicopalColors(key, count, { reverse = false, interpolate = true } = {}) {
  const palette = getDicopalPalette(key)
  if (!palette) return { colors: [], count: 0, exact: false, interpolated: false }

  const exactVariant = palette.variants.get(count)
  if (exactVariant) {
    const colors = reverse ? [...exactVariant].reverse() : [...exactVariant]
    return { colors, count, exact: true, interpolated: false }
  }

  if (palette.type === 'sequential' && interpolate && count >= 2) {
    return {
      colors: getSequentialColors(palette.name, count, reverse),
      count,
      exact: true,
      interpolated: true,
    }
  }

  const nearest = palette.numbers.reduce(
    (best, n) => (Math.abs(n - count) < Math.abs(best - count) ? n : best),
    palette.numbers[0],
  )
  const variant = palette.variants.get(nearest) ?? []
  const colors = reverse ? [...variant].reverse() : [...variant]
  return { colors, count: nearest, exact: false, interpolated: false }
}

/**
 * Build a diverging palette with a different number of classes on each side —
 * useful when the data's break points aren't centred on the midpoint.
 */
export function getDicopalAsymmetric(key, classLeft, classRight, options = {}) {
  const { centralClass = true, balanced = false, reverse = false } = options
  const palette = getDicopalPalette(key)
  if (!palette || palette.type !== 'diverging') return []
  if (classLeft < 1 || classRight < 1) return []
  try {
    return getAsymmetricDivergingColors(
      palette.name, classLeft, classRight, centralClass, balanced, reverse,
    )
  } catch {
    return []
  }
}

/** Small strip of colors used to preview a palette in a picker list. */
export function previewColors(key, max = 8) {
  const palette = getDicopalPalette(key)
  if (!palette) return []
  const n = Math.min(max, palette.maxNumber)
  return getDicopalColors(key, n, { interpolate: false }).colors
}
