import { isRef, computed, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type AffordanceElement<E extends SupportedElement> = E
  | E[]
  | Map<number, E[]>
  | Ref<E>
  | Ref<E[]>
  | Ref<Map<number, E[]>>

export function ensureReactivePlaneFromAffordanceElement<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): ComputedRef<Map<number, E[]>> {
  if (isRef(affordanceElement)) {
    if (affordanceElement.value instanceof Map) {
      return computed(() => affordanceElement.value) as ComputedRef<Map<number, E[]>>
    }

    if (Array.isArray(affordanceElement.value)) {
      return computed(() => new Map([[0, affordanceElement.value]])) as ComputedRef<Map<number, E[]>>
    }

    return computed(() => new Map([[0, [affordanceElement.value]]])) as ComputedRef<Map<number, E[]>>
  }

  if (affordanceElement instanceof Map) {
    return computed(() => affordanceElement) as ComputedRef<Map<number, E[]>>
  }

  if (Array.isArray(affordanceElement)) {
    return computed(() => new Map([[0, affordanceElement]])) as ComputedRef<Map<number, E[]>>
  }

  return computed(() => new Map([[0, [affordanceElement]]])) as ComputedRef<Map<number, E[]>>
}

export type AffordanceElementKind = 'element' | 'list' | 'plane'

export function toAffordanceElementKind<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): AffordanceElementKind {
  if (isRef(affordanceElement)) {
    if (affordanceElement.value instanceof Map) return 'plane'
    if (Array.isArray(affordanceElement.value)) return 'list'
    return 'element'
  }

  if (affordanceElement instanceof Map) return 'plane'
  if (Array.isArray(affordanceElement)) return 'list'
  return 'element'
}
