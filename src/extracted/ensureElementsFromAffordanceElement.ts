import { isRef, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { SupportedElement } from './elementApi'


export type AffordanceElement<ElementType extends SupportedElement> = ElementType
  | ElementType[]
  | Ref<ElementType>
  | Ref<ElementType[]>

export function ensureElementsFromAffordanceElement<ElementType extends SupportedElement> (affordanceElement: AffordanceElement<ElementType>): Ref<ElementType[]> {
  if (isRef(affordanceElement)) {
    if (Array.isArray(affordanceElement.value)) {
      return affordanceElement as Ref<ElementType[]>
    }

    return computed(() => [affordanceElement.value]) as ComputedRef<ElementType[]>
  }

  if (Array.isArray(affordanceElement)) {
    return computed(() => affordanceElement)
  }

  return computed(() => [affordanceElement])
}
