import { createEntries } from '@baleada/logic'

export function toEntries<Object extends Record<any, any>> (object: Object) {
  return createEntries<Object>()(object)
}
