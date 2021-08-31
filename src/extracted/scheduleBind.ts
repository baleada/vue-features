import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { ensureElementsRef } from './ensureElementsRef'
import { ensureWatchSources } from './ensureWatchSources'
import { schedule } from './schedule'

export type ScheduleBindValueEffectRequired<ValueType extends string | number | boolean> = {
  element: BindTarget,
  effect: ({ element, value, index }:  { element: HTMLElement, value: ValueType, index?: number }) => any,
  value: BindValue<ValueType>,
  watchSources: WatchSource | WatchSource[],
}

export type BindTarget = HTMLElement | HTMLElement[] | Ref<HTMLElement> | Ref<HTMLElement[]>

export type BindValue<ValueType extends string | number | boolean> =
  ValueType
  | Ref<ValueType>
  | BindToValue<ValueType>
  
export type BindToValue<ValueType extends string | number | boolean> = ({ element, index }: { element: HTMLElement, index: number }) => ValueType

export function scheduleBind<ValueType extends string | number | boolean> ({ element, effect, value, watchSources }: ScheduleBindValueEffectRequired<ValueType>): void {
  const elements = ensureElementsRef(element),
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
    const toValue = value

    schedule({
      effect: () => elements.value.forEach((element, index) => {
        if (element) {
          effect({ element, value: toValue({ element, index }), index })
        }
      }),
      // Value is an unchanging toValue function, so only the elements and user-defined watch sources are watched.
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
