import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  // Handle undefined, null, or non-numeric values
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatCurrency(amount: number): string {
  // Handle undefined, null, or non-numeric values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}