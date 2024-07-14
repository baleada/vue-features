import { shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './toRenderedKind'
import { defaultOptions as defaultUseElementApiOptions } from './useElementApi'
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
  ref: (index: number, meta?: Meta) => (element: E, refs?: Record<string, any>) => void,
  list: Ref<E[]>,
  status: Ref<{
    order: 'changed' | 'none',
    length: 'shortened' | 'lengthened' | 'none',
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Meta[]>,
  beforeUpdate: () => void,
}

export type UseListApiOptions<
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> = (
  & UseElementApiOptions<Identifies, Meta>
  & {
    toStatus?: (
      [currentList, currentMeta]: [SupportedElement[], Meta[]],
      [previousList, previousMeta]: [SupportedElement[], Meta[]]
    ) => ListApi<any>['status']['value'],
  }
)

const defaultListStatus: ListApi<any>['status']['value'] = {
  order: 'none',
  length: 'none',
  meta: 'none',
}

const defaultOptions: UseListApiOptions = {
  toStatus: ({ 0: currentList, 1: currentMeta }, { 0: previousList, 1: previousMeta }) => {
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

    return { order, length, meta }
  },
}


export function useListApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>
> (options: UseListApiOptions<Identifies, Meta> = {}): ListApi<E, Identifies, Meta> {
  const { identifies, defaultMeta, toStatus } = { ...{ ...defaultUseElementApiOptions, ...defaultOptions }, ...options }

  const list: ListApi<E, false, {}>['list'] = shallowRef([]),
        meta: ListApi<E, false, {}>['meta'] = shallowRef([]),
        ref: ListApi<E, false, {}>['ref'] = (index, m) => (newElement: E) => {
          if (newElement) {
            list.value[index] = newElement
            meta.value[index] = { ...defaultMeta, ...m }
          }
        },
        status: ListApi<E, false, {}>['status'] = shallowRef(defaultListStatus),
        beforeUpdate: ListApi<E, false, {}>['beforeUpdate'] = () => {
          list.value = []
          meta.value = []
        }

  onBeforeUpdate(beforeUpdate)

  watch(
    [list, meta],
    (current, previous) => {
      status.value = toStatus(current, previous)
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
      beforeUpdate: beforeUpdate,
      ids,
    } as ListApi<E, Identifies, Meta>
  }

  return {
    ref,
    list,
    meta,
    status,
    beforeUpdate: beforeUpdate,
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
