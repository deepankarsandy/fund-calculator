export function formatPercent(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`
}

export function pluralise(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

export function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
