export function hexToRgb(hex?: string): string {
  if (!hex) return '0,0,0'
  const normalized = hex.trim().replace(/^#/, '')
  // 3-digit hex
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    const r = parseInt(normalized[0] + normalized[0], 16)
    const g = parseInt(normalized[1] + normalized[1], 16)
    const b = parseInt(normalized[2] + normalized[2], 16)
    return `${r},${g},${b}`
  }
  // 6-digit hex
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    const r = parseInt(normalized.slice(0, 2), 16)
    const g = parseInt(normalized.slice(2, 4), 16)
    const b = parseInt(normalized.slice(4, 6), 16)
    return `${r},${g},${b}`
  }
  // Not a hex string — return fallback
  return '0,0,0'
}

export default hexToRgb
