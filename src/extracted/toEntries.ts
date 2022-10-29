import { createToEntries } from "@baleada/logic"

export function toEntries<Object extends Record<any, any>> (object: Object) {
  return createToEntries<keyof Object, Object[keyof Object]>()(object)
}
