import { shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { Plane } from './plane'
import type { SupportedElement } from './toAffordanceElementKind'
import { defaultOptions } from './useElementApi'
import type { UseElementApiOptions } from './useElementApi'

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
  ref: (row: number, column: number, meta?: Meta) => (element: E) => void,
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
> = UseElementApiOptions<Identifies, Meta>

export function usePlaneApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> (options: UsePlaneApiOptions<Identifies, Meta> = {}): PlaneApi<E, Identifies, Meta> {
  const { identifies, defaultMeta } = { ...defaultOptions, ...options }

  const plane: PlaneApi<E, false, {}>['plane'] = shallowRef(new Plane()),
        meta: PlaneApi<E, false, {}>['meta'] = shallowRef(new Plane()),
        ref: PlaneApi<E, false, {}>['ref'] = (row, column, m) => (newElement: E) => {
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
        } as const)

  onBeforeUpdate(() => {
    plane.value = new Plane()
    meta.value = new Plane()
  })

  watch(
    [plane, meta],
    ({ 0: currentPlane, 1: currentMeta }, { 0: previousPlane, 1: previousMeta }) => {
      const rowLength = (() => {
              if (currentPlane.length === 0) return 'n/a'
              if (currentPlane[0].length > previousPlane[0].length) return 'lengthened'
              if (currentPlane[0].length < previousPlane[0].length) return 'shortened'
              return 'none'
            })(),
            columnLength = (() => {
              if (currentPlane.length > previousPlane.length) return 'lengthened'
              if (currentPlane.length < previousPlane.length) return 'shortened'
              return 'none'
            })(),
            order = toOrder(
              currentPlane,
              previousPlane,
              (a, b) => a === b,
            ),
            meta = toOrder(
              currentMeta,
              previousMeta,
              (a, b) => JSON.stringify(a) === JSON.stringify(b),
            )

      status.value = { order, rowLength, columnLength, meta }
    },
    { flush: 'post' }
  )

  if (identifies) {
    const ids = identify(plane)

    bind(plane, { id: (row, column) => ids.value[row]?.[column] })

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

function toOrder<Item extends SupportedElement | Record<any, any>> (
  itemsA: Plane<Item>,
  itemsB: Plane<Item>,
  predicateEqual: (itemA: Item, itemB: Item) => boolean
) {
  for (let row = 0; row < itemsA.length; row++) {
    for (let column = 0; column < itemsA.length; column++) {
      if (!itemsA[row]?.[column] || !itemsB[row]?.[column]) continue
      if (!predicateEqual(itemsA[row][column], itemsB[row][column])) return 'changed'
    }
  }

  return 'none'
}
