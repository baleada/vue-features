import { watch, nextTick } from 'vue'
import type { Ref, WatchSource } from 'vue'
import type { Plane } from './plane'
import type { SupportedRendered } from './toRenderedKind'

export type OnPlaneRenderedOptions<R extends SupportedRendered, WatchSourceValue extends any> = {
  predicateRenderedWatchSourcesChanged?: (current: [Plane<R>, ...WatchSourceValue[]], previous: [Plane<R>, ...WatchSourceValue[]]) => boolean,
  planeEffect?: () => void,
  beforeItemEffects?: () => void,
  itemEffect?: (rendered: R, coordinates: [row: number, column: number]) => void,
  afterItemEffects?: () => void,
  watchSources?: WatchSource<WatchSourceValue>[],
}

export const defaultOptions: OnPlaneRenderedOptions<SupportedRendered, any> = {
  predicateRenderedWatchSourcesChanged: () => true,
  watchSources: [],
}

// TODO: expose `predicateRenderedWatchSourcesChanged` option from affordances to fully link to element API statuses

/**
 * Schedule a side effect to run for a reactive plane that is updated by a `flush: post` effect, and/or
 * optionally run an effect once for every item in a reactive plane.
 * 
 * The effect itself will immediately run on the next tick if items are available. After that, it will run with
 * `flush: post` after any watch source change (including the reactive plane).
 */
export function onPlaneRendered<R extends SupportedRendered, WatchSourceValue extends any> (
  plane: Ref<Plane<R>>,
  options: OnPlaneRenderedOptions<R, WatchSourceValue> = {},
) {
  const {
          predicateRenderedWatchSourcesChanged,
          planeEffect,
          beforeItemEffects,
          itemEffect,
          afterItemEffects,
          watchSources,
        } = { ...defaultOptions, ...options },
        withGuards = (
          timing: 'immediate' | 'flush',
          current: [Plane<R>, ...WatchSourceValue[]],
          previous: [Plane<R>, ...WatchSourceValue[]],
        ) => {
          if (timing === 'flush' && !predicateRenderedWatchSourcesChanged(current, previous)) return

          planeEffect?.()
    
          if (itemEffect) {
            beforeItemEffects?.()

            for (let row = 0; row < plane.value.length; row++) {
              for (let column = 0; column < plane.value[row].length; column++) {
                const rendered = plane.value[row][column]
                itemEffect(rendered, [row, column])
              }
            }
            
            afterItemEffects?.()
          }
        }
        
  let timing: 'immediate' | 'flush' = 'immediate'
  return watch(
    [plane, ...watchSources] as const,
    (current, previous) => {
      if (timing === 'immediate') {
        // Initial element API setup will not trigger this watcher to run immediately,
        // so `immediate: true` is set to make sure that happens.
        //
        // However, the initial run of this watcher will be before the DOM is updated,
        // so we should wait one tick before making the initial attempt.
        //
        // Future effect runs will happen after the DOM is updated (`flush: 'post'`)
        timing = 'flush'
        nextTick(() => withGuards('immediate', current, previous))
        return
      }

      withGuards(timing, current, previous)
    },
    { immediate: true, flush: 'post' }
  )
}
