import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { ensureReactivePlane } from './ensureReactivePlane'
import type { Plane, AffordanceElement } from './ensureReactivePlane'
import { ensureWatchSources } from './ensureWatchSources'
import { schedule } from './schedule'
import { createToEffectedStatus } from './createToEffectedStatus'
import { toAffordanceElementKind, useEffecteds } from '.'

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
  watchSources: WatchSource | WatchSource[],
): void {
  const affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane),
        elements = ensureReactivePlane(elementOrListOrPlane),
        ensuredWatchSources = ensureWatchSources(watchSources),
        effecteds = useEffecteds(),
        toEffectedStatus = createToEffectedStatus(effecteds)
  
  if (isRef(value)) {
    schedule({
      effect: () => {
        effecteds.clear()

        for (let row = 0; row < elements.value.length; row++) {
          for (let column = 0; column < elements.value[row].length; column++) {
            const element = elements.value[row][column]

            if (!element) return

            effecteds.set(element, [row, column])

            if (value.value === undefined) {
              remove(element)
            }

            assign(element, value.value, column, row)
          }
        }
      },
      watchSources: [elements, value, ...ensuredWatchSources],
      toEffectedStatus,
    })

    return
  }

  if (typeof value === 'function') {
    const get = value

    schedule({
      effect: () => {
        effecteds.clear()

        for (let row = 0; row < elements.value.length; row++) {
          for (let column = 0; column < elements.value[row].length; column++) {
            const element = elements.value[row][column]

            if (!element) return

            effecteds.set(element, [row, column])

            const value = affordanceElementKind === 'plane'
              ? get(row, column)
              : (get as BindValueGetter<HTMLElement, ValueType>)(column)

            if (value === undefined) {
              remove(element)
              return
            }

            assign(element, value, column, row)
          }
        }
      },
      watchSources: [elements, ...ensuredWatchSources],
      toEffectedStatus,
    })

    return
  }

  schedule({
    effect: () => {
      effecteds.clear()

      for (let row = 0; row < elements.value.length; row++) {
        for (let column = 0; column < elements.value[row].length; column++) {
          const element = elements.value[row][column]

          if (!element) return

          effecteds.set(element, [row, column])

          if (value === undefined) {
            remove(element)
            return
          }

          assign(element, value, column, row)
        }
      }
    },
    watchSources: [elements, ...ensuredWatchSources],
    toEffectedStatus,
  })
}
