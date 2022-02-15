import { isRef, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type AffordanceElement<E extends SupportedElement> = E
  | E[]
  | Ref<E>
  | Ref<E[]>

export function ensureReactiveMultipleFromAffordanceElement<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): Ref<E[]> {
  if (isRef(affordanceElement)) {
    if (Array.isArray(affordanceElement.value)) {
      return affordanceElement as Ref<E[]>
    }

    return computed(() => [affordanceElement.value]) as ComputedRef<E[]>
  }

  if (Array.isArray(affordanceElement)) {
    return computed(() => affordanceElement)
  }

  return computed(() => [affordanceElement])
}

export type AffordanceElementType = 'single' | 'multiple'

export function toAffordanceElementType<E extends SupportedElement> (
  affordanceElement: AffordanceElement<E>
): AffordanceElementType {
  if (isRef(affordanceElement)) {
    if (Array.isArray(affordanceElement.value)) {
      return 'multiple'
    }

    return 'single'
  }

  if (Array.isArray(affordanceElement)) {
    return 'multiple'
  }

  return 'single'
}

export function isSingle<E extends SupportedElement> (
  affordanceElement: AffordanceElement<any>
): affordanceElement is E {
  return !isRef(affordanceElement) && !Array.isArray(affordanceElement)
}

export function isReactiveSingle<E extends SupportedElement> (
  affordanceElement: AffordanceElement<any>
): affordanceElement is Ref<E> {
  return isRef(affordanceElement) && !Array.isArray(affordanceElement.value)
}

export function isMultiple<E extends SupportedElement> (
  affordanceElement: AffordanceElement<any>
): affordanceElement is E[] {
  return !isRef(affordanceElement) && Array.isArray(affordanceElement)
}

export function isReactiveMultiple<E extends SupportedElement> (
  affordanceElement: AffordanceElement<any>
): affordanceElement is Ref<E[]> {
  return isRef(affordanceElement) && Array.isArray(affordanceElement.value)
}
