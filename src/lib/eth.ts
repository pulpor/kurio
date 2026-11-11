/**
 * Precision arithmetic helpers for ETH decimal strings matching Figma specifications.
 */

export function parseEth(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatEth(value: number | string): string {
  const num = typeof value === 'string' ? parseEth(value) : value;
  return num.toFixed(3);
}

export function formatEthDisplay(value: number | string): string {
  const num = typeof value === 'string' ? parseEth(value) : value;
  const s3 = num.toFixed(3);
  if (s3.endsWith('0')) {
    return num.toFixed(2);
  }
  return s3;
}

export function addEth(a: string, b: string): string {
  const sum = parseEth(a) + parseEth(b);
  return sum.toFixed(3);
}

export function multiplyEth(a: string, quantity: number): string {
  const total = parseEth(a) * quantity;
  return total.toFixed(3);
}

export function subtractEth(a: string, b: string): string {
  const diff = Math.max(0, parseEth(a) - parseEth(b));
  return diff.toFixed(3);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
