import { type Ref } from 'vue'
import { narrowReactivePlane } from './narrowReactivePlane'
import {
  onPlaneRendered,
  defaultOptions,
  type OnPlaneRenderedOptions,
} from './onPlaneRendered'
import { type SupportedRendered } from './toRenderedKind'

type OnListRenderedOptions<R extends SupportedRendered, WatchSourceValue extends any> = (
  & Omit<
    OnPlaneRenderedOptions<R, WatchSourceValue>,
    | 'predicateRenderedWatchSourcesChanged'
    | 'planeEffect'
    | 'itemEffect'
  >
  & {
    predicateRenderedWatchSourcesChanged?: (current: [R[], ...WatchSourceValue[]], previous: [R[], ...WatchSourceValue[]]) => boolean,
    listEffect?: () => void,
    itemEffect?: (rendered: R, index: number) => void,
  }
)

/**
 * Schedule a side effect to run for a reactive list that is updated by a `flush: post` effect, and/or
 * optionally run an effect once for every item in a reactive list.
 *
 * The effect itself will immediately run on the next tick if items are available. After that, it will run with
 * `flush: post` after any watch source change (including the reactive list).
 */
export function onListRendered<R extends SupportedRendered, WatchSourceValue extends any> (
  list: Ref<R[]>,
  options: OnListRenderedOptions<R, WatchSourceValue> = {},
) {
  const plane = narrowReactivePlane<R>(list),
        {
          predicateRenderedWatchSourcesChanged,
          listEffect,
          itemEffect,
        } = { ...(defaultOptions as unknown as OnListRenderedOptions<R, WatchSourceValue>), ...options }

  return onPlaneRendered(
    plane,
    {
      ...options,
      predicateRenderedWatchSourcesChanged: (current, previous) => predicateRenderedWatchSourcesChanged(
        [current[0][0], ...current.slice(1) as WatchSourceValue[]],
        [previous?.[0]?.[0], ...previous.slice(1) as WatchSourceValue[]],
      ),
      planeEffect: listEffect,
      ...(itemEffect && {
        itemEffect: (rendered, { column }) => itemEffect(rendered, column),
      }),
    }
  )
}
