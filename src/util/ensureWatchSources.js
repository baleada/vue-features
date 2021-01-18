export default function ensureWatchSources (rawWatchSources) {
  if (!rawWatchSources) {
    return []
  }

  return Array.isArray(rawWatchSources)
    ? rawWatchSources
    : [rawWatchSources]
}

