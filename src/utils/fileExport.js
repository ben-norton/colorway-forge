function download(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAsText(colors, filename = 'palette.txt') {
  const content = colors.join('\n') + '\n'
  download(content, filename, 'text/plain')
}

export function exportAsCSS(colors, filename = 'palette.css', prefix = 'color') {
  const vars = colors.map((hex, i) => `  --${prefix}-${i + 1}: ${hex};`).join('\n')
  const content = `:root {\n${vars}\n}\n`
  download(content, filename, 'text/css')
}

export function cssPreview(colors, prefix = 'color') {
  return colors.slice(0, 5).map((hex, i) => `--${prefix}-${i + 1}: ${hex};`).join('\n')
}
