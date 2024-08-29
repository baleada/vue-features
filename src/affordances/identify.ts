import { ref, computed } from 'vue'
import type { Ref, ComputedRef, WatchSource } from 'vue'
import { nanoid } from 'nanoid/non-secure'
import {
  narrowReactivePlane,
  onPlaneRendered,
  narrowWatchSources,
  toRenderedKind,
  predicateRenderedWatchSourcesChanged,
  Plane,
} from '../extracted'
import type { BindElement, SupportedElement } from '../extracted'

export type IdentifyOptions = {
  watchSource?: WatchSource | WatchSource[],
}

export type Id<B extends BindElement> = B extends (SupportedElement | Ref<SupportedElement>)
  ? ComputedRef<string>
  : B extends (SupportedElement[] | Ref<SupportedElement[]>)
    ? ComputedRef<string[]>
    : Ref<Plane<string>>

export function identify<B extends BindElement> (
  elementOrListOrPlane: B,
  options: IdentifyOptions = {}
): Id<B> {
  const { watchSource } = options,
        ids = ref<Plane<string>>(new Plane([])),
        elements = narrowReactivePlane(elementOrListOrPlane),
        narrowedWatchSources = narrowWatchSources(watchSource),
        nanoids = new WeakMap<SupportedElement, string>()

  let newIds = new Plane<string>([])

  onPlaneRendered(
    elements,
    {
      predicateRenderedWatchSourcesChanged,
      itemEffect: (element, coordinates) => {
        if (!element) return

        if (!nanoids.get(element)) nanoids.set(element, nanoid(8))
        newIds.set(
          coordinates,
          !!element.id
            ? element.id
            : nanoids.get(element)
        )
      },
      afterItemEffects: () => {
        ids.value = newIds
        newIds = new Plane<string>([])
      },
      watchSources: narrowedWatchSources,
    }
  )

  const affordanceElementKind = toRenderedKind(elementOrListOrPlane)

  if (affordanceElementKind === 'plane') return ids as Id<B>
  if (affordanceElementKind === 'list') return computed(() => ids.value[0]) as Id<B>
  return computed(() => ids.value[0][0]) as Id<B>
}
