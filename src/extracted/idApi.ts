import { ref, computed } from 'vue'
import type { Ref, WatchSource } from 'vue'
import { nanoid } from 'nanoid'
import { ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
import { ensureWatchSources } from './ensureWatchSources'
import type { BindElement } from './scheduleBind'
import { schedule } from './schedule'

export function useSingleId (element: HTMLElement | Ref<HTMLElement>, { watchSources }: { watchSources?: WatchSource | WatchSource[] } = {}) {
  const ids = useIds(element, { watchSources })
  return computed(() => ids.value[0])
}

export function useMultipleIds (elements: HTMLElement[] | Ref<HTMLElement[]>, { watchSources }: { watchSources?: WatchSource | WatchSource[] } = {}) {
  const ids = useIds(elements, { watchSources })
  return computed(() => ids.value)
}

function useIds (element: BindElement, { watchSources }: { watchSources?: WatchSource | WatchSource[] } = {}) {
  const ids = ref<string[]>([]),
        ensuredElements = ensureElementsFromAffordanceElement(element),
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
