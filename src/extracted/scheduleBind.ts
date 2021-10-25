import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { AffordanceElement, ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
import { ensureWatchSources } from './ensureWatchSources'
import { schedule } from './schedule'

export type BindElement = AffordanceElement<HTMLElement>

export type BindValue<ValueType extends string | number | boolean> =
  ValueType
  | Ref<ValueType>
  | BindValueGetter<ValueType>
  
export type BindValueGetter<ValueType extends string | number | boolean> = ({ element, index }: { element: HTMLElement, index: number }) => ValueType

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
        ensuredWatchSources = ensureWatchSources(watchSources)
  
  // Schedule an effect to run with an updated reactive value.
  if (isRef(value)) {
    schedule({
      effect: () => elements.value.forEach(element => {
        if (element) {
          if (value.value === undefined) {
            remove({ element })
            return
          }
          
          assign({ element, value: value.value })
        }
      }),
      // Value is an unchanging primitive, so only the elements and user-defined watch sources are watched.
      watchSources: [elements, value, ...ensuredWatchSources]
    })

    return
  }

  // Schedule an effect that binds a different value to each element in a v-for.
  if (typeof value === 'function') {
    const getValue = value

    schedule({
      effect: () => elements.value.forEach((element, index) => {
        if (element) {
          const value = getValue({ element, index })

          if (value === undefined) {
            remove({ element, index })
            return
          }

          assign({ element, value: getValue({ element, index }), index })
        }
      }),
      // Value is an unchanging getValue function, so only the elements and user-defined watch sources are watched.
      watchSources: [elements, ...ensuredWatchSources]
    })

    return
  }

  // Schedule an effect to run with the same primitive value each time.
  schedule({
    effect: () => {
      elements.value.forEach(element => {
        if (element) {
          if (value === undefined) {
            remove({ element })
            return
          }
          
          assign({ element, value })
        }
      })
    },
    // Value is an unchanging primitive, so only the elements and user-defined watch sources are watched.
    watchSources: [elements, ...ensuredWatchSources],
  })
}
