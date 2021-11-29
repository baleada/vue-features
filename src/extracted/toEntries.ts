import { createToEntries } from "@baleada/logic"

export function toEntries<Key extends string, Value> (object: Record<Key, Value>) {
  return createToEntries<Key, Value>()(object)
}
