import { isRef, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export function ensureTargets (rawTargets: Element | Element[] | Ref<Element> | Ref<Element[]>): Ref<Element[]> {
  if (isRef(rawTargets)) {
    if (Array.isArray(rawTargets.value)) {
      rawTargets as Ref<Element[]>
    }

    return computed(() => [rawTargets.value]) as ComputedRef<Element[]>
  }

  if (Array.isArray(rawTargets)) {
    return computed(() => rawTargets)
  }

  return computed(() => [rawTargets])
}
