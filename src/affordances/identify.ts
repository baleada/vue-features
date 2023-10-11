import { ref, computed } from 'vue'
import type { Ref, ComputedRef, WatchSource } from 'vue'
import { nanoid } from 'nanoid/non-secure'
import {
  narrowReactivePlane,
  schedule,
  narrowWatchSources,
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
  const ids = ref<string[][]>([[]]),
        narrowedElements = narrowReactivePlane(elementOrListOrPlane),
        narrowedWatchSources = narrowWatchSources(options.watchSource),
        effecteds = useEffecteds(),
        nanoids = new WeakMap<HTMLElement, string>(),
        effect = () => {
          effecteds.clear()

          const newIds: string[][] = []

          for (let row = 0; row < narrowedElements.value.length; row++) {
            if (!newIds[row]) newIds[row] = []

            for (let column = 0; column < narrowedElements.value[0].length; column++) {
              const element = narrowedElements.value[row][column]

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
    watchSources: [narrowedElements, ...narrowedWatchSources],
    toEffectedStatus: createToEffectedStatus(effecteds),
  })

  const affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane)
  
  if (affordanceElementKind === 'plane') return computed(() => ids.value) as Id<B>
  if (affordanceElementKind === 'list') return computed(() => ids.value[0]) as Id<B>
  return computed(() => ids.value[0][0]) as Id<B>
}
