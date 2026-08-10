import chroma from 'chroma-js'
import { contrastRatio } from './wcag.js'

function minPairwiseDeltaE(colors) {
  let min = Infinity
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const d = chroma.deltaE(colors[i], colors[j])
      if (d < min) min = d
    }
  }
  return min === Infinity ? 0 : min
}

export function optimizePerceptual(hexColors, maxIter = 300) {
  if (hexColors.length < 2) return [...hexColors]
  let colors = hexColors.map(h => chroma(h))
  let bestScore = minPairwiseDeltaE(colors.map(c => c.hex()))
  const STEP = 8

  for (let iter = 0; iter < maxIter; iter++) {
    const idx = iter % colors.length
    const c = colors[idx]
    const [l, ch, h] = c.lch()

    for (const [dl, dch, dh] of [
      [STEP, 0, 0], [-STEP, 0, 0],
      [0, STEP, 0], [0, -STEP, 0],
      [0, 0, STEP * 2], [0, 0, -STEP * 2],
    ]) {
      const nl = Math.max(0, Math.min(100, l + dl))
      const nc = Math.max(0, Math.min(180, ch + dch))
      const nh = (h + dh + 360) % 360
      let candidate
      try {
        candidate = chroma.lch(nl, nc, nh)
      } catch {
        continue
      }
      const trial = colors.map((c2, i) => i === idx ? candidate : c2)
      const score = minPairwiseDeltaE(trial.map(c2 => c2.hex()))
      if (score > bestScore) {
        colors = trial
        bestScore = score
        break
      }
    }
  }
  return colors.map(c => c.hex())
}

export function optimizeWCAGContrast(hexColors, background = '#ffffff') {
  return hexColors.map(hex => {
    let color = chroma(hex)
    if (contrastRatio(color.hex(), background) >= 4.5) return hex

    const bgLum = chroma(background).luminance()
    const [, s, l] = color.hsl()

    // Try increasing lightness toward white if background is dark, or decreasing toward black if light
    const direction = bgLum < 0.5 ? 1 : -1
    let current = l

    for (let i = 0; i < 100; i++) {
      current = Math.max(0, Math.min(1, current + direction * 0.01))
      try {
        const candidate = color.set('hsl.l', current)
        if (contrastRatio(candidate.hex(), background) >= 4.5) {
          return candidate.hex()
        }
      } catch {
        break
      }
    }

    // If direction failed, try the other way
    current = l
    for (let i = 0; i < 100; i++) {
      current = Math.max(0, Math.min(1, current - direction * 0.01))
      try {
        const candidate = color.set('hsl.l', current)
        if (contrastRatio(candidate.hex(), background) >= 4.5) {
          return candidate.hex()
        }
      } catch {
        break
      }
    }

    return hex
  })
}
