import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { AffordanceElement, ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
import { ensureWatchSources } from './ensureWatchSources'
import { schedule } from './schedule'

export type ScheduleBindValueEffectRequired<ValueType extends string | number | boolean> = {
  element: BindElement,
  effect: ({ element, value, index }:  { element: HTMLElement, value: ValueType, index?: number }) => any,
  value: BindValue<ValueType>,
  watchSources: WatchSource | WatchSource[],
}

export type BindElement = AffordanceElement<HTMLElement>

export type BindValue<ValueType extends string | number | boolean> =
  ValueType
  | Ref<ValueType>
  | BindValueGetter<ValueType>
  
export type BindValueGetter<ValueType extends string | number | boolean> = ({ element, index }: { element: HTMLElement, index: number }) => ValueType

export function scheduleBind<ValueType extends string | number | boolean> ({ element, effect, value, watchSources }: ScheduleBindValueEffectRequired<ValueType>): void {
  const elements = ensureElementsFromAffordanceElement(element),
        ensuredWatchSources = ensureWatchSources(watchSources)
  
  // Schedule an effect to run with an updated reactive value.
  if (isRef(value)) {
    schedule({
      effect: () => elements.value.forEach(element => {
        if (element) {
          if (value.value !== preventEffect()) {
            effect({ element, value: value.value })
          }
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
          effect({ element, value: getValue({ element, index }), index })
        }
      }),
      // Value is an unchanging getValue function, so only the elements and user-defined watch sources are watched.
      watchSources: [elements, ...ensuredWatchSources]
    })

    return
  }

  // Schedule an effect to run with the same primitive value each time.
  schedule({
    effect: () => elements.value.forEach(element => {
      if (element) {
        effect({ element, value })
      }
    }),
    // Value is an unchanging primitive, so only the elements and user-defined watch sources are watched.
    watchSources: [elements, ...ensuredWatchSources],
  })
}

export function preventEffect () {
  // nanoid
  return 'jWTGABb6SjmqtoBqwNl4g' as const
}
