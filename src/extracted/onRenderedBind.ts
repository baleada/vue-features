import { isRef, type Ref, type WatchSource } from 'vue'
import { type Plane } from './plane'
import { type Coordinates } from './coordinates'
import { narrowReactivePlane } from './narrowReactivePlane'
import {
  toRenderedKind,
  type Rendered,
  type SupportedElement,
} from './toRenderedKind'
import { narrowWatchSources } from './narrowWatchSources'
import { onPlaneRendered } from './onPlaneRendered'
import {
  predicateRenderedWatchSourcesChanged,
} from './predicateRenderedWatchSourcesChanged'

export type BindElement = Rendered<SupportedElement>

export type BindValue<B extends BindElement, ValueType extends string | number | boolean> = (
  | ValueType
  | Ref<ValueType>
  | BindValueGetter<B, ValueType>
)

export type BindValueGetter<B extends BindElement, ValueType extends string | number | boolean> = (
  B extends Plane<SupportedElement> | Ref<Plane<SupportedElement>>
    ? (coordinates: Coordinates) => ValueType
    : B extends SupportedElement[] | Ref<SupportedElement[]>
      ? (index: number) => ValueType
      : () => ValueType
)

export function onRenderedBind<B extends BindElement, ValueType extends string | number | boolean> (
  elementOrListOrPlane: B,
  assign: (element: SupportedElement, value: ValueType, indexOrColumn?: number, row?: number) => void,
  remove: (element: SupportedElement) => void,
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
            ? (get as BindValueGetter<Plane<SupportedElement>, ValueType>)({ row, column })
            : renderedKind === 'list'
              ? (get as BindValueGetter<SupportedElement[], ValueType>)(column)
              : (get as BindValueGetter<SupportedElement, ValueType>)()

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
