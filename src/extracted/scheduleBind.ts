import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import type { Plane } from './plane'
import { narrowReactivePlane } from './narrowReactivePlane'
import { toAffordanceElementKind } from './toAffordanceElementKind'
import type { AffordanceElement } from './toAffordanceElementKind'
import { narrowWatchSources } from './narrowWatchSources'
import { schedule } from './schedule'

export type BindElement = AffordanceElement<HTMLElement>

export type BindValue<B extends BindElement, ValueType extends string | number | boolean> =
  ValueType
  | Ref<ValueType>
  | BindValueGetter<B, ValueType>
  
export type BindValueGetter<B extends BindElement, ValueType extends string | number | boolean> = B extends Plane<HTMLElement>
  ? (row: number, column: number) => ValueType
  : B extends Ref<Plane<HTMLElement>>
    ? (row: number, column: number) => ValueType
    : (index: number) => ValueType

export function scheduleBind<B extends BindElement, ValueType extends string | number | boolean> (
  elementOrListOrPlane: B,
  assign: (element: HTMLElement, value: ValueType, indexOrColumn?: number, row?: number) => void,
  remove: (element: HTMLElement) => void,
  value: BindValue<B, ValueType>,
  watchSources: WatchSource<string | number | boolean> | WatchSource<string | number | boolean>[],
): void {
  const affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane),
        elements = narrowReactivePlane(elementOrListOrPlane),
        narrowedWatchSources = narrowWatchSources(watchSources)

  if (isRef(value)) {
    schedule({
      elements,
      effect: (element, row, column) => {
        if (value.value === undefined) {
          remove(element)
          return
        }

        assign(element, value.value, column, row)
      },
      watchSources: [value, ...narrowedWatchSources],
    })

    return
  }

  if (typeof value === 'function') {
    const get = value

    schedule({
      elements,
      effect: (element, row, column) => {
        const value = affordanceElementKind === 'plane'
          ? get(row, column)
          : (get as BindValueGetter<HTMLElement, ValueType>)(column)

        if (value === undefined) {
          remove(element)
          return
        }

        assign(element, value, column, row)
      },
      watchSources: narrowedWatchSources, // `get` is not used a watch source because it often needs arguments
    })

    return
  }

  schedule({
    elements,
    effect: (element, row, column) => {
      if (value === undefined) {
        remove(element)
        return
      }

      assign(element, value, column, row)
    },
    watchSources: narrowedWatchSources,
  })
}
