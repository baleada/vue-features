import { shallowRef, isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { AffordanceElement, ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
import { ensureWatchSources } from './ensureWatchSources'
import { schedule } from './schedule'
import { createToEffectedStatus } from './createToEffectedStatus'
import { useEffecteds } from '.'

export type BindElement = AffordanceElement<HTMLElement>

export type BindValue<ValueType extends string | number | boolean> =
  ValueType
  | Ref<ValueType>
  | BindValueGetter<ValueType>
  
export type BindValueGetter<ValueType extends string | number | boolean> = (index: number) => ValueType

export function scheduleBind<ValueType extends string | number | boolean> (
  { element, assign, remove, value, watchSources }: {
    element: BindElement,
    assign: ({ element, value, index }:  { element: HTMLElement, value: ValueType, index?: number }) => void,
    remove: ({ element, index }:  { element: HTMLElement, index?: number }) => void,
    value: BindValue<ValueType>,
    watchSources: WatchSource | WatchSource[],
  }
): void {
  const elements = ensureElementsFromAffordanceElement(element),
        ensuredWatchSources = ensureWatchSources(watchSources),
        effecteds = useEffecteds(),
        toEffectedStatus = createToEffectedStatus(effecteds)
  
  if (isRef(value)) {
    schedule({
      effect: () => {
        effecteds.value.clear()

        elements.value.forEach((element, index) => {
          if (!element) {
            return
          }

          effecteds.value.set(element, index)

          if (value.value === undefined) {
            remove({ element })
            return
          }
          
          assign({ element, value: value.value })
        })
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
        effecteds.value.clear()

        elements.value.forEach((element, index) => {
          if (!element) {
            return
          }

          effecteds.value.set(element, index)

          const value = get(index)

          if (value === undefined) {
            remove({ element, index })
            return
          }

          assign({ element, value: get(index), index })
        })
      },
      watchSources: [elements, ...ensuredWatchSources],
      toEffectedStatus,
    })

    return
  }

  schedule({
    effect: () => {
      effecteds.value.clear()
      
      elements.value.forEach((element, index) => {
        if (!element) {
          return
        }
        
        effecteds.value.set(element, index)

        if (value === undefined) {
          remove({ element })
          return
        }
        
        assign({ element, value })
      })
    },
    watchSources: [elements, ...ensuredWatchSources],
    toEffectedStatus,
  })
}
