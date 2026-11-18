export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatINRDecimal(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatCrore(amount: number): string {
  if (Math.abs(amount) >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  }
  if (Math.abs(amount) >= 100_000) {
    return `₹${(amount / 100_000).toFixed(2)} L`
  }
  return formatINR(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}
