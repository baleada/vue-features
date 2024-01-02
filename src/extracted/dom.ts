import { isRef } from 'vue'
import type { Ref } from 'vue'
import { Plane } from './plane'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type AffordanceElement<E extends SupportedElement> = E
  | E[]
  | Plane<E>
  | Ref<E>
  | Ref<E[]>
  | Ref<Plane<E>>

export function toAffordanceElementKind<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): 'element' | 'list' | 'plane' {
  if (isRef(affordanceElement)) {
    if (affordanceElement.value instanceof Plane) return 'plane'
    if (Array.isArray(affordanceElement.value)) return 'list'
    return 'element'
  }

  if (affordanceElement instanceof Plane) return 'plane'
  if (Array.isArray(affordanceElement)) return 'list'
  return 'element'
}
