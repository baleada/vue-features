import { watch, nextTick } from 'vue'
import type { Ref, WatchCallback, WatchSource } from 'vue'
import type { SupportedElement } from './dom'
import type { Plane } from './plane'
import { useEffecteds } from './useEffecteds'
import { createToEffectedStatus } from './createToEffectedStatus'

/**
 * Schedule a side effect to run once for every element in a reactive plane, flushing 'post',
 * after any watch source change (including the reactive plane).
 * Truly the magic that glues all affordances together.
 */
export function schedule<E extends SupportedElement> (
  {
    elements,
    beforeEffects,
    afterEffects,
    effect: elementEffect,
    watchSources,
  }: {
    elements: Ref<Plane<E>>,
    beforeEffects?: () => void,
    afterEffects?: () => void,
    effect: (element: E, row: number, column: number) => void,
    watchSources: WatchSource[],
  }
) {
  const effecteds = useEffecteds(),
        toEffectedStatus = createToEffectedStatus(effecteds),
        effect: WatchCallback<[Plane<E>, ...WatchSource[]]> = (...params) => {
          if (toEffectedStatus(...params) === 'fresh') return

          effecteds.clear()
    
          beforeEffects?.()
    
          for (let row = 0; row < elements.value.length; row++) {
            for (let column = 0; column < elements.value[row].length; column++) {
              const element = elements.value[row][column]
    
              if (!element) return
    
              effecteds.set(element, [row, column])
    
              elementEffect(element, row, column)
            }
          }
    
          afterEffects?.()
        }

  let timing: 'immediate' | 'flush' = 'immediate'
  watch(
    [elements, ...watchSources] as const,
    (...params) => {
      if (timing === 'immediate') {
        // Initial element API setup will not trigger this watcher to run immediately,
        // so `immediate: true` is set to make sure that happens.
        //
        // However, the initial run of this watcher will be before the DOM is updated,
        // so we should wait one tick before making the initial attempt.
        //
        // Future effect runs will happen after the DOM is updated (`flush: 'post'`),
        timing = 'flush'
        nextTick(() => effect(...params))
        return
      }

      effect(...params)
    },
    { immediate: true, flush: 'post' }
  )
}
