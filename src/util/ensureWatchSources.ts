import type { WatchSource } from 'vue'

export function ensureWatchSources (rawWatchSources?: WatchSource | WatchSource[]): WatchSource[] {
  if (!rawWatchSources) {
    return []
  }

  return Array.isArray(rawWatchSources)
    ? rawWatchSources
    : [rawWatchSources]
}

