import { watch } from 'vue'
import type { Ref, WatchCallback } from 'vue'
import type { SupportedElement } from './dom'

export function onRendered<E extends SupportedElement>(
  element: Ref<E>,
  effect: WatchCallback<E>,
) {
  watch(
    element,
    (current, ...params) => {
      if (!current) return
      effect(current, ...params)
    },
    { immediate: true, flush: 'post' },
  )
}
