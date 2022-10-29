import { isRef, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type AffordanceElement<E extends SupportedElement> = E
  | E[]
  | Plane<E>
  | Ref<E>
  | Ref<E[]>
  | Ref<Plane<E>>

export class Plane<T extends any> extends Array<T[]> {}

export function ensureReactivePlane<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): ComputedRef<Plane<E>> {
  if (isRef(affordanceElement)) {
    if (affordanceElement.value instanceof Plane) {
      return computed(() => affordanceElement.value) as ComputedRef<Plane<E>>
    }

    if (Array.isArray(affordanceElement.value)) {
      return computed(() => new Plane(affordanceElement.value as E[]))
    }

    return computed(() => new Plane([affordanceElement.value] as E[]))
  }

  if (affordanceElement instanceof Plane) {
    return computed(() => affordanceElement) as ComputedRef<Plane<E>>
  }

  if (Array.isArray(affordanceElement)) {
    return computed(() => new Plane(affordanceElement as E[]))
  }

  return computed(() => new Plane([affordanceElement] as E[]))
}

export type AffordanceElementKind = 'element' | 'list' | 'plane'

export function toAffordanceElementKind<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): AffordanceElementKind {
  if (isRef(affordanceElement)) {
    if (affordanceElement.value instanceof Plane) return 'plane'
    if (Array.isArray(affordanceElement.value)) return 'list'
    return 'element'
  }

  if (affordanceElement instanceof Plane) return 'plane'
  if (Array.isArray(affordanceElement)) return 'list'
  return 'element'
}
