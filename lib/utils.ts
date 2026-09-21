import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Drferdi Transformer Engine V2 — Utility helpers
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
