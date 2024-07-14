import { watch, onMounted, isRef } from 'vue'
import type { Ref, WatchSource } from 'vue'
import type { Plane } from './plane'
import type { Coordinates } from './coordinates'
import type { SupportedRendered } from './toRenderedKind'

export type OnPlaneRenderedOptions<R extends SupportedRendered, WatchSourceValue extends any> = {
  predicateRenderedWatchSourcesChanged?: (current: [Plane<R>, ...WatchSourceValue[]], previous: [Plane<R>, ...WatchSourceValue[]]) => boolean,
  planeEffect?: () => void,
  beforeItemEffects?: () => void,
  itemEffect?: (rendered: R, coordinates: Coordinates) => void,
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
          current: [Plane<R>, ...WatchSourceValue[]],
          previous: [Plane<R>, ...WatchSourceValue[]],
        ) => {
          if (
            !current[0].length
            || !predicateRenderedWatchSourcesChanged(current, previous)
          ) return

          planeEffect?.()

          if (itemEffect) {
            beforeItemEffects?.()

            for (let row = 0; row < plane.value.length; row++) {
              for (let column = 0; column < plane.value[row].length; column++) {
                const rendered = plane.value.get([row, column])
                itemEffect(rendered, [row, column])
              }
            }

            afterItemEffects?.()
          }
        }

  onMounted(() => {
    if (!plane.value[0].length) return

    withGuards(
      [plane.value, ...watchSources.map(watchSource => {
        if (isRef(watchSource)) {
          return watchSource.value
        }

        if (typeof watchSource === 'function') {
          return watchSource()
        }

        return watchSource
      })] as const,
      [undefined, ...watchSources.map(() => undefined)]
    )
  })

  return watch(
    [plane, ...watchSources] as const,
    withGuards,
    { flush: 'post' }
  )
}
