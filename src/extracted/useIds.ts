import { ref, computed } from 'vue'
import type { Ref, WatchSource } from 'vue'
import { nanoid } from 'nanoid'
import { ensureElementsRef } from './ensureElementsRef'
import { ensureWatchSources } from './ensureWatchSources'
import type { BindTarget } from './scheduleBind'
import { schedule } from './schedule'

export function useSingleId (element: HTMLElement | Ref<HTMLElement>, { watchSources }: { watchSources?: WatchSource | WatchSource[] } = {}) {
  const ids = useIds(element, { watchSources })
  return computed(() => ids.value[0])
}

export function useMultipleIds (elements: HTMLElement[] | Ref<HTMLElement[]>, { watchSources }: { watchSources?: WatchSource | WatchSource[] } = {}) {
  const ids = useIds(elements, { watchSources })
  return computed(() => ids.value)
}

function useIds (element: BindTarget, { watchSources }: { watchSources?: WatchSource | WatchSource[] } = {}) {
  const ids = ref<string[]>([]),
        ensuredElements = ensureElementsRef(element),
        ensuredWatchSources = ensureWatchSources(watchSources),
        nanoids = new WeakMap<HTMLElement, string>(),
        effect = () => {
          ids.value = ensuredElements.value.map(element => {
            if (!element) {
              return
            }

            if (!nanoids.get(element)) {
              nanoids.set(element, nanoid())
            }

            return !!element.id ? element.id : nanoids.get(element)
          })
        }
  
  schedule({
    effect,
    watchSources: [() => ensuredElements.value, ...ensuredWatchSources]
  })

  return ids
}
