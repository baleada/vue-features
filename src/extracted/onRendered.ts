import type { Ref } from 'vue'
import { narrowReactivePlane } from './narrowReactivePlane'
import { onPlaneRendered, defaultOptions } from './onPlaneRendered'
import type { OnPlaneRenderedOptions } from './onPlaneRendered'
import type { SupportedRendered } from './toRenderedKind'

type OnRenderedOptions<R extends SupportedRendered, WatchSourceValue extends any> = (
  & Omit<
    OnPlaneRenderedOptions<R, WatchSourceValue>,
    | 'predicateRenderedWatchSourcesChanged'
    | 'planeEffect'
    | 'itemEffect'
    | 'beforeItemEffects'
    | 'afterItemEffects'
  >
  & {
    predicateRenderedWatchSourcesChanged?: (current: [R, ...WatchSourceValue[]], previous: [R, ...WatchSourceValue[]]) => boolean,
    effect?: (rendered: R) => void,
  }
)

/**
 * Schedule a side effect to run for a reactive element that is updated by a `flush: post` effect.
 *
 * The effect itself will immediately run on the next tick if items are available. After that, it will run with
 * `flush: post` after any watch source change (including the reactive element).
 */
export function onRendered<R extends SupportedRendered, WatchSourceValue extends any> (
  element: Ref<R>,
  options: OnRenderedOptions<R, WatchSourceValue> = {},
) {
  const plane = narrowReactivePlane<R>(element),
        { predicateRenderedWatchSourcesChanged, effect } = { ...(defaultOptions as unknown as OnRenderedOptions<R, WatchSourceValue>), ...options }

  return onPlaneRendered(
    plane,
    {
      ...options,
      predicateRenderedWatchSourcesChanged: (current, previous) => predicateRenderedWatchSourcesChanged(
        [current[0][0][0], ...current.slice(1) as WatchSourceValue[]],
        [previous[0][0][0], ...previous.slice(1) as WatchSourceValue[]],
      ),
      ...(effect && {
        itemEffect: rendered => effect(rendered),
      }),
    }
  )
}
