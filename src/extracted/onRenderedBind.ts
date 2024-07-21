import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import type { Plane } from './plane'
import type { Coordinates } from './coordinates'
import { narrowReactivePlane } from './narrowReactivePlane'
import { toRenderedKind } from './toRenderedKind'
import type { Rendered } from './toRenderedKind'
import { narrowWatchSources } from './narrowWatchSources'
import { onPlaneRendered } from './onPlaneRendered'
import { predicateRenderedWatchSourcesChanged } from './predicateRenderedWatchSourcesChanged'

export type BindElement = Rendered<HTMLElement>

export type BindValue<B extends BindElement, ValueType extends string | number | boolean> = (
  | ValueType
  | Ref<ValueType>
  | BindValueGetter<B, ValueType>
)

export type BindValueGetter<B extends BindElement, ValueType extends string | number | boolean> = (
  B extends Plane<HTMLElement> | Ref<Plane<HTMLElement>>
    ? (coordinates: Coordinates) => ValueType
    : B extends HTMLElement[] | Ref<HTMLElement[]>
      ? (index: number) => ValueType
      : () => ValueType
)

export function onRenderedBind<B extends BindElement, ValueType extends string | number | boolean> (
  elementOrListOrPlane: B,
  assign: (element: HTMLElement, value: ValueType, indexOrColumn?: number, row?: number) => void,
  remove: (element: HTMLElement) => void,
  value: BindValue<B, ValueType>,
  watchSources: WatchSource<string | number | boolean> | WatchSource<string | number | boolean>[],
) {
  const renderedKind = toRenderedKind(elementOrListOrPlane),
        elements = narrowReactivePlane(elementOrListOrPlane),
        narrowedWatchSources = narrowWatchSources(watchSources)

  if (isRef(value)) {
    return onPlaneRendered(
      elements,
      {
        predicateRenderedWatchSourcesChanged,
        itemEffect: (element, { row, column }) => {
          if (!element) return

          if (value.value === undefined) {
            remove(element)
            return
          }

          assign(element, value.value, column, row)
        },
        watchSources: [value, ...narrowedWatchSources],
      }
    )
  }

  if (typeof value === 'function') {
    const get = value

    return onPlaneRendered(
      elements,
      {
        predicateRenderedWatchSourcesChanged,
        itemEffect: (element, { row, column }) => {
          if (!element) return

          const value = renderedKind === 'plane'
            ? (get as BindValueGetter<Plane<HTMLElement>, ValueType>)({ row, column })
            : renderedKind === 'list'
              ? (get as BindValueGetter<HTMLElement[], ValueType>)(column)
              : (get as BindValueGetter<HTMLElement, ValueType>)()

          if (value === undefined) {
            remove(element)
            return
          }

          assign(element, value, column, row)
        },
        watchSources: narrowedWatchSources, // `get` is not used a watch source because it often needs arguments
      }
    )
  }

  return onPlaneRendered(
    elements,
    {
      predicateRenderedWatchSourcesChanged,
      itemEffect: (element, { row, column }) => {
        if (!element) return

        if (value === undefined) {
          remove(element)
          return
        }

        assign(element, value, column, row)
      },
      watchSources: narrowedWatchSources,
    }
  )
}
