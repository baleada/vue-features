import { isRef, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { Plane } from './plane'
import type { Rendered, SupportedRendered } from './toRenderedKind'

export function narrowReactivePlane<R extends SupportedRendered> (
  rendered: Rendered<R>
): ComputedRef<Plane<R>> {
  if (isRef(rendered)) {
    if (rendered.value instanceof Plane) {
      return computed(() => rendered.value) as ComputedRef<Plane<R>>
    }

    if (Array.isArray(rendered.value)) {
      return computed(() => new Plane(rendered.value as R[]))
    }

    return computed(() => new Plane([rendered.value] as R[]))
  }

  if (rendered instanceof Plane) {
    return computed(() => rendered) as ComputedRef<Plane<R>>
  }

  if (Array.isArray(rendered)) {
    return computed(() => new Plane(rendered as R[]))
  }

  return computed(() => new Plane([rendered] as R[]))
}
