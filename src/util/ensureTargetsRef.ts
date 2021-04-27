import { isRef, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export type Target = Element | Element[] | Ref<Element> | Ref<Element[]>

export function ensureTargetsRef (rawTargets: Target): Ref<Element[]> {
  if (isRef(rawTargets)) {
    if (Array.isArray(rawTargets.value)) {
      return rawTargets as Ref<Element[]>
    }

    return computed(() => [rawTargets.value]) as ComputedRef<Element[]>
  }

  if (Array.isArray(rawTargets)) {
    return computed(() => rawTargets)
  }

  return computed(() => [rawTargets])
}
