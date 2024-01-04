import { shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './toRenderedKind'
import { defaultOptions } from './useElementApi'
import type { UseElementApiOptions } from './useElementApi'

export type ListApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> = Identifies extends true
  ? ListApiBase<E, Meta> & { ids: Id<Ref<E[]>> }
  : ListApiBase<E, Meta>

export type ListApiBase<
  E extends SupportedElement,
  Meta extends Record<any, any> = Record<never, never>
> = {
  ref: (index: number, meta?: Meta) => (element: E) => void,
  list: Ref<E[]>,
  status: Ref<{
    order: 'changed' | 'none',
    length: 'shortened' | 'lengthened' | 'none',
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Meta[]>,
}

export type UseListApiOptions<
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> = UseElementApiOptions<Identifies, Meta>

export function useListApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> (options: UseListApiOptions<Identifies, Meta> = {}): ListApi<E, Identifies, Meta> {
  const { identifies, defaultMeta } = { ...defaultOptions, ...options }

  const list: ListApi<E, false, {}>['list'] = shallowRef([]),
        meta: ListApi<E, false, {}>['meta'] = shallowRef([]),
        ref: ListApi<E, false, {}>['ref'] = (index, m) => (newElement: E) => {
          if (newElement) {
            list.value[index] = newElement
            meta.value[index] = { ...defaultMeta, ...m }
          }
        },
        status: ListApi<E, false, {}>['status'] = shallowRef({
          order: 'none',
          length: 'none',
          meta: 'none',
        } as const)

  onBeforeUpdate(() => {
    list.value = []
    meta.value = []
  })

  watch(
    [list, meta],
    ({ 0: currentList, 1: currentMeta }, { 0: previousList, 1: previousMeta }) => {
      const length = (() => {
              if (currentList.length > previousList.length) return 'lengthened'
              if (currentList.length < previousList.length) return 'shortened'
              return 'none'
            })(),
            order = toListOrder(
              currentList,
              previousList,
              (c, p) => c === p
            ),
            meta = toListOrder(
              currentMeta,
              previousMeta,
              (c, p) => JSON.stringify(c) === JSON.stringify(p)
            )

      status.value = { order, length, meta }
    },
    { flush: 'post' }
  )

  if (identifies) {
    const ids = identify(list)

    // @ts-expect-error
    bind(list, { id: index => ids.value[index] })

    return {
      ref,
      list,
      meta,
      status,
      ids,
    } as ListApi<E, Identifies, Meta>
  }

  return {
    ref,
    list,
    meta,
    status,
  } as ListApi<E, Identifies, Meta>
}

function toListOrder<Item extends SupportedElement | Record<any, any>> (
  itemsA: Item[],
  itemsB: Item[],
  predicateEqual: (itemA: Item, itemB: Item) => boolean
) {
  for (let i = 0; i < itemsA.length; i++) {
    if (!itemsA[i] || !itemsB[i]) continue
    if (!predicateEqual(itemsA[i], itemsB[i])) return 'changed'
  }

  return 'none'
}
