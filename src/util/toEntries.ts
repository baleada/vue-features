
// Preferable to Object.entries for type safety
export function toEntries<Key extends string, Value> (object: Record<Key, Value>): [Key, Value][] {
  const entries = []

  for (const key in object) {
    entries.push([key, object[key]])
  }

  return entries
}
