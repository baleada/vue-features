import { shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { Plane } from './plane'
import type { SupportedElement } from './toRenderedKind'
import { defaultOptions } from './useElementApi'
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
  ref: (coordinates: [row: number, column: number], meta?: Meta) => (element: E) => void,
  plane: Ref<Plane<E>>,
  status: Ref<{
    order: 'changed' | 'none',
    rowLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual rows
    columnLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual columns
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Plane<Meta>>,
  beforeUpdate: () => void,
}

export type UsePlaneApiOptions<
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> = UseElementApiOptions<Identifies, Meta>

export function usePlaneApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> (options: UsePlaneApiOptions<Identifies, Meta> = {}): PlaneApi<E, Identifies, Meta> {
  const { identifies, defaultMeta } = { ...defaultOptions, ...options }

  const plane: PlaneApi<E, false, {}>['plane'] = shallowRef(new Plane()),
        meta: PlaneApi<E, false, {}>['meta'] = shallowRef(new Plane()),
        ref: PlaneApi<E, false, {}>['ref'] = ([row, column], m) => (newElement: E) => {
          if (newElement) {
            ;(plane.value[row] || (plane.value[row] = []))[column] = newElement
            ;(meta.value[row] || (meta.value[row] = []))[column] = { ...defaultMeta, ...m }
          }
        },
        status: PlaneApi<E, false, {}>['status'] = shallowRef({
          order: 'none',
          rowLength: 'none',
          columnLength: 'none',
          meta: 'none',
        } as const),
        beforeUpdate: PlaneApi<E, false, {}>['beforeUpdate'] = () => {
          plane.value = new Plane()
          meta.value = new Plane()
        }

  onBeforeUpdate(beforeUpdate)

  watch(
    [plane, meta],
    ({ 0: currentPlane, 1: currentMeta }, { 0: previousPlane, 1: previousMeta }) => {
      const { rowLength, columnLength, order } = toPlaneStatus(currentPlane, previousPlane),
            meta = toPlaneOrder(
              currentMeta,
              previousMeta,
              { predicateEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
            )

      status.value = { order, rowLength, columnLength, meta }
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
      beforeUpdate,
      ids,
    } as PlaneApi<E, Identifies, Meta>
  }

  return {
    ref,
    plane,
    meta,
    status,
    beforeUpdate,
  } as PlaneApi<E, Identifies, Meta>
}
