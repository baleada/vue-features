import type { WatchSource } from 'vue'

export function ensureWatchSources (rawWatchSources?: WatchSource | WatchSource[]): WatchSource[] {
  if (rawWatchSources === undefined) {
    return []
  }

  return Array.isArray(rawWatchSources)
    ? rawWatchSources
    : [rawWatchSources]
}

