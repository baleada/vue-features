import { watch, nextTick } from 'vue'
import type { Ref, WatchCallback } from 'vue'
import type { SupportedElement } from './toAffordanceElementKind'

export function onRendered<E extends SupportedElement>(
  element: Ref<E>,
  effect: WatchCallback<E>,
) {
  let timing: 'immediate' | 'flush' = 'immediate'
  watch(
    element,
    (current, ...params) => {
      if (timing === 'immediate') {
        // Initial element API setup will not trigger this watcher to run immediately,
        // so `immediate: true` is set to make sure that happens.
        //
        // However, the initial run of this watcher will be before the DOM is updated,
        // so we should wait one tick before making the initial attempt.
        //
        // Future effect runs will happen after the DOM is updated (`flush: 'post'`)
        timing = 'flush'
        nextTick(() => {
          if (!current) return
          effect(current, ...params)
        })
        return
      }

      if (!current) return
      effect(current, ...params)
    },
    { immediate: true, flush: 'post' },
  )
}
