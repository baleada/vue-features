import { isRef, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { Plane } from './plane'
import type { SupportedElement, AffordanceElement } from './toAffordanceElementKind'

export function narrowReactivePlane<E extends SupportedElement> (
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
