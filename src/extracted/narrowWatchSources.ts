import type { WatchSource } from 'vue'

export function narrowWatchSources (rawWatchSources?: WatchSource | WatchSource[]): WatchSource[] {
  if (rawWatchSources === undefined) {
    return []
  }

  return Array.isArray(rawWatchSources)
    ? rawWatchSources
    : [rawWatchSources]
}

