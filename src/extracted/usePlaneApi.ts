import { shallowRef, onBeforeUpdate, watch, type Ref } from 'vue'
import { createDeepEqual } from '@baleada/logic'
import { bind, identify, type Id } from '../affordances'
import { Plane } from './plane'
import { type Coordinates } from './coordinates'
import { type SupportedElement } from './toRenderedKind'
import {
  defaultOptions as defaultUseElementApiOptions,
  type UseElementApiOptions,
} from './useElementApi'
import { toPlaneStatus } from './toPlaneStatus'
import { toPlaneOrder } from './toPlaneOrder'
import {
  predicateSomeStatusChanged,
} from './predicateSomeStatusChanged'

export type PlaneApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>,
> = Identifies extends true
  ? PlaneApiBase<E, Meta> & { ids: Id<Ref<Plane<E>>> }
  : PlaneApiBase<E, Meta>

export type PlaneApiBase<
  E extends SupportedElement,
  Meta extends Record<any, any> = Record<never, never>,
> = {
  ref: (coordinates: Coordinates, meta?: Meta) => (element: E, refs?: Record<string, any>) => void,
  plane: Ref<Plane<E>>,
  status: Ref<{
    order: 'changed' | 'none',
    rowWidth: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual rows
    columnHeight: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual columns
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Plane<Meta>>,
}

export type UsePlaneApiOptions<
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>,
> = (
  & UseElementApiOptions<Identifies, Meta>
  & {
    toStatus?: (
      [currentPlane, currentMeta]: [Plane<any>, Plane<any>],
      [previousPlane, previousMeta]: [Plane<any>, Plane<any>]
    ) => PlaneApi<any>['status']['value'],
  }
)

export const defaultPlaneStatus: PlaneApi<any>['status']['value'] = {
  order: undefined,
  rowWidth: undefined,
  columnHeight: undefined,
  meta: undefined,
}

const defaultOptions: UsePlaneApiOptions = {
  toStatus: ({ 0: currentPlane, 1: currentMeta }, { 0: previousPlane, 1: previousMeta }) => {
    const { rowWidth, columnHeight, order } = toPlaneStatus(currentPlane, previousPlane),
          meta = predicateSomeStatusChanged([rowWidth, columnHeight, order])
            ? 'changed'
            : toPlaneOrder(
              currentMeta,
              previousMeta,
              { predicateEqual: (currentPoint, previousPoint) => createDeepEqual(previousPoint)(currentPoint) },
            )

    return { order, rowWidth, columnHeight, meta }
  },
}

export function usePlaneApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>,
> (options: UsePlaneApiOptions<Identifies, Meta> = {}): PlaneApi<E, Identifies, Meta> {
  const { identifies, defaultMeta, toStatus } = { ...{ ...defaultUseElementApiOptions, ...defaultOptions }, ...options }

  const plane: PlaneApi<E, false, {}>['plane'] = shallowRef(new Plane([])),
        meta: PlaneApi<E, false, {}>['meta'] = shallowRef(new Plane([])),
        ref: PlaneApi<E, false, {}>['ref'] = ({ row, column }, m) => (newElement: E) => {
          if (!newElement) return
          plane.value.set({ row, column }, newElement)
          meta.value.set({ row, column }, { ...defaultMeta, ...m })
        },
        status: PlaneApi<E, false, {}>['status'] = shallowRef(defaultPlaneStatus)

  onBeforeUpdate(() => {
    plane.value = new Plane()
    meta.value = new Plane()
  })

  watch(
    [plane, meta],
    (current, previous) => {
      status.value = toStatus(current, previous)
    },
    { immediate: true, flush: 'post' }
  )

  if (identifies) {
    const ids = identify(plane)

    bind<Ref<Plane<SupportedElement>>, 'id'>(
      plane,
      { id: ({ row, column }) => ids.value.get({ row, column })  }
    )

    return {
      ref,
      plane,
      meta,
      status,
      ids,
    } as PlaneApi<E, Identifies, Meta>
  }

  return {
    ref,
    plane,
    meta,
    status,
  } as PlaneApi<E, Identifies, Meta>
}
