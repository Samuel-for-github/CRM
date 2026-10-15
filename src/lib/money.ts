export function minorUnitsToCurrency(minorUnits: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(minorUnits / 100);
}

export function normalizeMoney(value: string | number): number {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }

  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}