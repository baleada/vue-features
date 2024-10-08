import {
  ref,
  computed,
  getCurrentInstance,
  type Ref,
  type ComputedRef,
  type WatchSource,
} from 'vue'
import {
  narrowReactivePlane,
  onPlaneRendered,
  narrowWatchSources,
  toRenderedKind,
  predicateRenderedWatchSourcesChanged,
  Plane,
  getId,
  type BindElement,
  type SupportedElement,
} from '../extracted'

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
        idsByElement = new WeakMap<SupportedElement, string>(),
        instance = getCurrentInstance()

  let newIds = new Plane<string>([])

  onPlaneRendered(
    elements,
    {
      predicateRenderedWatchSourcesChanged,
      itemEffect: (element, coordinates) => {
        if (!element) return

        if (!idsByElement.get(element)) idsByElement.set(element, getId(instance))

        newIds.set(
          coordinates,
          !!element.id
            ? element.id
            : idsByElement.get(element)
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
