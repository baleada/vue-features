import type { WatchSource } from 'vue'

export function narrowWatchSources (rawWatchSources?: WatchSource | WatchSource[]): WatchSource[] {
  return rawWatchSources === undefined
    ? []
    : Array.isArray(rawWatchSources)
      ? rawWatchSources
      : [rawWatchSources]
}

