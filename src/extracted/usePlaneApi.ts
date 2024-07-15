import { shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { Plane } from './plane'
import type { Coordinates } from './coordinates'
import type { SupportedElement } from './toRenderedKind'
import { defaultOptions as defaultUseElementApiOptions } from './useElementApi'
import type { UseElementApiOptions } from './useElementApi'
import { toPlaneStatus } from './toPlaneStatus'
import { toPlaneOrder } from './toPlaneOrder'

export type PlaneApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> = Identifies extends true
  ? PlaneApiBase<E, Meta> & { ids: Id<Ref<Plane<E>>> }
  : PlaneApiBase<E, Meta>

export type PlaneApiBase<
  E extends SupportedElement,
  Meta extends Record<any, any> = Record<never, never>
> = {
  ref: (coordinates: Coordinates, meta?: Meta) => (element: E, refs?: Record<string, any>) => void,
  plane: Ref<Plane<E>>,
  status: Ref<{
    order: 'changed' | 'none',
    rowLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual rows
    columnLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual columns
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Plane<Meta>>,
}

export type UsePlaneApiOptions<
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
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
  order: 'none',
  rowLength: 'none',
  columnLength: 'none',
  meta: 'none',
}

const defaultOptions: UsePlaneApiOptions = {
  toStatus: ({ 0: currentPlane, 1: currentMeta }, { 0: previousPlane, 1: previousMeta }) => {
    const { rowLength, columnLength, order } = toPlaneStatus(currentPlane, previousPlane),
          meta = toPlaneOrder(
            currentMeta,
            previousMeta,
            { predicateEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
          )

    return { order, rowLength, columnLength, meta }
  },
}

export function usePlaneApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> (options: UsePlaneApiOptions<Identifies, Meta> = {}): PlaneApi<E, Identifies, Meta> {
  const { identifies, defaultMeta, toStatus } = { ...{ ...defaultUseElementApiOptions, ...defaultOptions }, ...options }

  const plane: PlaneApi<E, false, {}>['plane'] = shallowRef(new Plane([])),
        meta: PlaneApi<E, false, {}>['meta'] = shallowRef(new Plane([])),
        ref: PlaneApi<E, false, {}>['ref'] = ([row, column], m) => (newElement: E) => {
          if (newElement) {
            plane.value.set([row, column], newElement)
            meta.value.set([row, column], { ...defaultMeta, ...m })
          }
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
    { flush: 'post' }
  )

  if (identifies) {
    const ids = identify(plane)

    // TODO: support passing reactive data structure as value instead of getter
    // @ts-expect-error
    bind(plane, { id: ([row, column]) => ids.value[row]?.[column] })

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
