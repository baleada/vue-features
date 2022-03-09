import { ref, computed, isRef } from 'vue'
import type { Ref, ComputedRef, WatchSource } from 'vue'
import { nanoid } from 'nanoid/non-secure'
import {
  ensureReactivePlane,
  schedule,
  ensureWatchSources,
  createToEffectedStatus,
  useEffecteds,
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
  const ids = ref<string[][]>([]),
        ensuredElements = ensureReactivePlane(elementOrListOrPlane),
        ensuredWatchSources = ensureWatchSources(options.watchSource),
        effecteds = useEffecteds(),
        nanoids = new WeakMap<HTMLElement, string>(),
        effect = () => {
          effecteds.clear()

          const newIds: string[][] = []

          for (let row = 0; row < ensuredElements.value.length; row++) {
            if (!newIds[row]) newIds[row] = []

            for (let column = 0; column < ensuredElements.value[0].length; column++) {
              const element = ensuredElements.value[row][column]

              if (!element) return

              effecteds.set(element, [row, column])

              if (!nanoids.get(element)) nanoids.set(element, nanoid(8))

              newIds[row][column] = !!element.id ? element.id : nanoids.get(element)
            }
          }

          ids.value = newIds
        }
  
  schedule({
    effect,
    watchSources: [ensuredElements, ...ensuredWatchSources],
    toEffectedStatus: createToEffectedStatus(effecteds),
  })

  const affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane)
  
  if (affordanceElementKind === 'plane') return computed(() => ids.value) as Id<B>
  if (affordanceElementKind === 'list') return computed(() => ids.value[0]) as Id<B>
  return computed(() => ids.value[0][0]) as Id<B>
}
