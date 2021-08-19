import { isRef, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { SupportedElement } from './useElements'


export type Target<ElementType> = ElementType
  | ElementType[]
  | Ref<ElementType>
  | Ref<ElementType[]>

export function ensureElementsRef<ElementType> (targetOrTargets: Target<ElementType>): Ref<ElementType[]> {
  if (isRef(targetOrTargets)) {
    if (Array.isArray(targetOrTargets.value)) {
      return targetOrTargets as Ref<ElementType[]>
    }

    return computed(() => [targetOrTargets.value]) as ComputedRef<ElementType[]>
  }

  if (Array.isArray(targetOrTargets)) {
    return computed(() => targetOrTargets)
  }

  return computed(() => [targetOrTargets])
}
