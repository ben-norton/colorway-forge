import chroma from 'chroma-js'

export function hexToRgb(hex) {
  const [r, g, b] = chroma(hex).rgb()
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
}

export function rgbToHex({ r, g, b }) {
  return chroma(r, g, b).hex()
}

export function rgbToCmyk({ r, g, b }) {
  const rp = r / 255, gp = g / 255, bp = b / 255
  const k = 1 - Math.max(rp, gp, bp)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const c = (1 - rp - k) / (1 - k)
  const m = (1 - gp - k) / (1 - k)
  const y = (1 - bp - k) / (1 - k)
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

export function cmykToRgb({ c, m, y, k }) {
  const kf = k / 100
  const r = 255 * (1 - c / 100) * (1 - kf)
  const g = 255 * (1 - m / 100) * (1 - kf)
  const b = 255 * (1 - y / 100) * (1 - kf)
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
}

export function normalizeToHex(value, mode) {
  if (mode === 'hex') {
    const h = value.startsWith('#') ? value : '#' + value
    if (chroma.valid(h)) return chroma(h).hex()
    throw new Error(`Invalid hex: ${value}`)
  }
  if (mode === 'rgb') return rgbToHex(value)
  if (mode === 'cmyk') return rgbToHex(cmykToRgb(value))
  throw new Error(`Unknown mode: ${mode}`)
}

export function isValidHex(str) {
  return chroma.valid(str)
}

/**
 * Parse a plain list of hex codes separated by commas, whitespace, semicolons or
 * newlines — e.g. what you get from copying a palette out of a spreadsheet or a
 * CSS file. The leading '#' is optional and quotes are tolerated.
 */
export function parseHexList(text) {
  const colors = []
  const invalid = []
  const tokens = text.split(/[\s,;]+/).filter(Boolean)
  for (const raw of tokens) {
    const token = raw.replace(/^['"`]+|['"`]+$/g, '').replace(/[,;]+$/, '')
    if (!token) continue
    const candidate = token.startsWith('#') ? token : '#' + token
    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(candidate) && chroma.valid(candidate)) {
      colors.push(chroma(candidate).hex())
    } else if (/^[a-z]+$/i.test(token) && chroma.valid(token)) {
      // CSS named colors ('tomato', 'rebeccapurple') paste in just as often as hex.
      colors.push(chroma(token).hex())
    } else {
      invalid.push(token)
    }
  }
  return { colors, invalid }
}

export function parseJsonColor(entry) {
  if (typeof entry === 'string') {
    const h = entry.startsWith('#') ? entry : '#' + entry
    if (chroma.valid(h)) return chroma(h).hex()
    return null
  }
  if (Array.isArray(entry) && entry.length >= 3) {
    return rgbToHex({ r: entry[0], g: entry[1], b: entry[2] })
  }
  if (typeof entry === 'object' && entry !== null) {
    if ('r' in entry) return rgbToHex(entry)
  }
  return null
}
