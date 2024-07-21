import { shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { createDeepEqual } from '@baleada/logic'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './toRenderedKind'
import { defaultOptions as defaultUseElementApiOptions } from './useElementApi'
import type { UseElementApiOptions } from './useElementApi'
import { predicateSomeStatusChanged } from './predicateSomeStatusChanged'
import { predicateNullish } from './predicateNullish'

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
  meta: Ref<Meta[]>
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
            if (currentList.length > (previousList?.length || 0)) return 'lengthened'
            if (currentList.length < (previousList?.length || 0)) return 'shortened'
            return 'none'
          })(),
          order = toListOrder(
            currentList,
            previousList,
            (currentItem, previousItem) => currentItem === previousItem
          ),
          meta = predicateSomeStatusChanged([length, order])
            ? 'changed'
            : toListOrder(
              currentMeta,
              previousMeta,
              (currentItem, previousItem) => createDeepEqual(previousItem)(currentItem)
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
        status: ListApi<E, false, {}>['status'] = shallowRef(defaultListStatus)

  onBeforeUpdate(() => {
    list.value = []
    meta.value = []
  })

  watch(
    [list, meta],
    (current, previous) => {
      status.value = toStatus(current, previous)
    },
    { flush: 'post', immediate: true }
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
  currentItems: Item[],
  previousItems: Item[],
  predicateEqual: (currentItem: Item, previousItem: Item) => boolean
) {
  for (let i = 0; i < currentItems.length; i++) {
    if (predicateNullish(currentItems[i]) || predicateNullish(previousItems?.[i])) continue
    if (!predicateEqual(currentItems[i], previousItems[i])) return 'changed'
  }

  return 'none'
}
