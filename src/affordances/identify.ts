import { ref, computed } from 'vue'
import type { Ref, ComputedRef, WatchSource } from 'vue'
import { nanoid } from 'nanoid/non-secure'
import {
  narrowReactivePlane,
  schedule,
  narrowWatchSources,
  toAffordanceElementKind,
} from '../extracted'
import type { BindElement } from '../extracted'

export type IdentifyOptions = {
  watchSource?: WatchSource | WatchSource[],
}

export type Id<B extends BindElement> = B extends (HTMLElement | Ref<HTMLElement>)
  ? ComputedRef<string>
  : B extends (HTMLElement[] | Ref<HTMLElement[]>)
    ? ComputedRef<string[]>
    : ComputedRef<string[][]>

export function identify<B extends BindElement> (
  elementOrListOrPlane: B,
  options: IdentifyOptions = {}
): Id<B> {
  const { watchSource } = options,
        ids = ref<string[][]>([[]]),
        elements = narrowReactivePlane(elementOrListOrPlane),
        narrowedWatchSources = narrowWatchSources(watchSource),
        nanoids = new WeakMap<HTMLElement, string>()

  let newIds: string[][]
  
  schedule({
    elements,
    beforeEffects: () => newIds = [],
    afterEffects: () => ids.value = newIds,
    effect: (element, row, column) => {
      if (!nanoids.get(element)) nanoids.set(element, nanoid(8))
      ;(newIds[row] || (newIds[row] = []))[column] = !!element.id
        ? element.id
        : nanoids.get(element)
    },
    watchSources: narrowedWatchSources,
  })

  const affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane)
  
  if (affordanceElementKind === 'plane') return computed(() => ids.value) as Id<B>
  if (affordanceElementKind === 'list') return computed(() => ids.value[0]) as Id<B>
  return computed(() => ids.value[0][0]) as Id<B>
}
