// Drferdi CTE V2 — localStorage Abstraction for History

import { TRANSFORM_LIMITS } from './constants'
import type { HistoryItem } from './schemas'
import { HistoryItemSchema } from './schemas'

const STORAGE_KEY = 'drferdi-cte-history'

function safeGetStorage(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    return parsed
      .map((item) => HistoryItemSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data as HistoryItem)
  } catch {
    return []
  }
}

function safeSetStorage(items: HistoryItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}

export function getHistory(): HistoryItem[] {
  return safeGetStorage()
}

export function addToHistory(item: HistoryItem): HistoryItem[] {
  const history = safeGetStorage()
  const updated = [item, ...history].slice(0, TRANSFORM_LIMITS.maxHistoryItems)
  safeSetStorage(updated)
  return updated
}

export function removeFromHistory(id: string): HistoryItem[] {
  const history = safeGetStorage()
  const updated = history.filter((item) => item.id !== id)
  safeSetStorage(updated)
  return updated
}

export function toggleStar(id: string): HistoryItem[] {
  const history = safeGetStorage()
  const updated = history.map((item) =>
    item.id === id ? { ...item, starred: !item.starred } : item
  )
  safeSetStorage(updated)
  return updated
}

export function clearHistory(): HistoryItem[] {
  safeSetStorage([])
  return []
}
