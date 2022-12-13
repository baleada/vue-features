import { ref, shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import { Plane } from './ensureReactivePlane'
import type { SupportedElement } from './ensureReactivePlane'

export type Api<E extends SupportedElement, K extends Kind, Identified extends boolean, Meta extends Record<any, any> = {}> = K extends 'plane'
  ? Identified extends true
    ? IdentifiedPlaneApi<E, Meta>
    : PlaneApi<E, Meta>
  : K extends 'list'
    ? Identified extends true
      ? IdentifiedListApi<E, Meta>
      : ListApi<E, Meta>
    : Identified extends true
      ? IdentifiedElementApi<E, Meta>
      : ElementApi<E, Meta>

export type Kind = 'element' | 'list' | 'plane'

export type IdentifiedPlaneApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = PlaneApi<E, Meta> & { ids: Id<Ref<Plane<E>>> }
export type IdentifiedListApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = ListApi<E, Meta> & { ids: Id<Ref<E[]>> }
export type IdentifiedElementApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = ElementApi<E, Meta> & { id: Id<Ref<E>> }

export type PlaneApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = {
  getRef: (row: number, column: number, meta?: Partial<Meta>) => (el: E) => any,
  elements: Ref<Plane<E>>,
  status: Ref<{
    order: 'changed' | 'none',
    rowLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual rows
    columnLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual columns
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Plane<Meta>>,
}

export type ListApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = {
  getRef: (index: number, meta?: Partial<Meta>) => (el: E) => any,
  elements: Ref<E[]>,
  status: Ref<{
    order: 'changed' | 'none',
    length: 'shortened' | 'lengthened' | 'none',
    meta: 'changed' | 'none',
  }>,
  meta: Ref<Meta[]>,
}

export type ElementApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = {
  getRef: (meta?: Partial<Meta>) => (el: E) => any,
  element: Ref<null | E>,
  meta: Ref<Meta>,
  status: Ref<{
    meta: 'changed' | 'none',
  }>
}

export type UseElementOptions<K extends Kind, Identified extends boolean, Meta extends Record<any, any> = {}> = {
  kind?: K,
  identified?: Identified,
  defaultMeta?: Meta,
}

const defaultOptions: UseElementOptions<'element', false, {}> = {
  kind: 'element',
  identified: false,
  defaultMeta: {},
}

export function useElementApi<
  E extends SupportedElement,
  K extends Kind = 'element',
  Identified extends boolean = false,
  Meta extends Record<any, any> = {}
> (options: UseElementOptions<K, Identified, Meta> = {}): Api<E, K, Identified, Meta> {
  const { kind, identified, defaultMeta } = { ...defaultOptions, ...options }

  if (kind === 'plane') {
    const elements: Api<E, 'plane', false, {}>['elements'] = shallowRef(new Plane()),
          meta: Api<E, 'plane', false, {}>['meta'] = shallowRef(new Plane()),
          getRef: Api<E, 'plane', false, {}>['getRef'] = (row, column, m) => newElement => {
            if (newElement) {
              (elements.value[row] || (elements.value[row] = []))[column] = newElement
              if (m) (meta.value[row] || (meta.value[row] = []))[column] = { ...defaultMeta, ...m }
            }
          },
          status: Api<E, 'plane', false, {}>['status'] = shallowRef({
            order: 'none',
            rowLength: 'none',
            columnLength: 'none',
            meta: 'none',
          } as const)

    onBeforeUpdate(() => {
      elements.value = new Plane()
      meta.value = new Plane()
    })

    watch(
      [elements, meta],
      ({ 0: currentElements, 1: currentMeta }, { 0: previousElements, 1: previousMeta }) => {
        const rowLength = (() => {
                if (currentElements.length === 0) return 'n/a'
                if (currentElements[0].length > previousElements[0].length) return 'lengthened'
                if (currentElements[0].length < previousElements[0].length) return 'shortened'
                return 'none'
              })(),
              columnLength = (() => {
                if (currentElements.length > previousElements.length) return 'lengthened'
                if (currentElements.length < previousElements.length) return 'shortened'
                return 'none'
              })(),
              order = toPlaneOrder(
                currentElements,
                previousElements,
                (a, b) => a === b,
              ),
              meta = toPlaneOrder(
                currentMeta,
                previousMeta,
                (a, b) => JSON.stringify(a) === JSON.stringify(b),
              )

        status.value = { order, rowLength, columnLength, meta }
      },
      { flush: 'post' }
    )

    if (identified) {
      const ids = identify(elements)

      return {
        getRef,
        elements,
        meta,
        status,
        ids,
      } as Api<E, K, Identified, Meta>
    }

    return {
      getRef,
      elements,
      meta,
      status,
    } as Api<E, K, Identified, Meta>
  }

  if (kind === 'list') {
    const elements: Api<E, 'list', false, {}>['elements'] = shallowRef([]),
          meta: Api<E, 'list', false, {}>['meta'] = shallowRef([]),
          getRef: Api<E, 'list', false, {}>['getRef'] = (index, m) => newElement => {
            if (newElement) {
              elements.value[index] = newElement
              if (m) meta.value[index] = { ...defaultMeta, ...m }
            }
          },
          status: Api<E, 'list', false, {}>['status'] = shallowRef({
            order: 'none',
            length: 'none',
            meta: 'none',
          } as const)

    onBeforeUpdate(() => {
      elements.value = []
      meta.value = []
    })

    watch(
      [elements, meta],
      ({ 0: currentElements, 1: currentMeta }, { 0: previousElements, 1: previousMeta }) => {
        const length = (() => {
                if (currentElements.length > previousElements.length) return 'lengthened'
                if (currentElements.length < previousElements.length) return 'shortened'
                return 'none'
              })(),
              order = toListOrder(
                currentElements,
                previousElements,
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

    if (identified) {
      const ids = identify(elements)

      return {
        getRef,
        elements,
        meta,
        status,
        ids,
      } as Api<E, K, Identified, Meta>
    }

    return {
      getRef,
      elements,
      meta,
      status,
    } as Api<E, K, Identified, Meta>
  }

  const element: Api<E, 'element', false, {}>['element'] = ref(null),
        meta: Api<E, 'element', false, {}>['meta'] = ref({}),
        getRef: Api<E, 'element', false, {}>['getRef'] = m => newElement => {
          if (newElement) {
            element.value = newElement
            if (m) meta.value = { ...defaultMeta, ...m }
          }
        }

  if (identified) {
    const id = identify(element)
    
    return {
      getRef,
      element,
      meta,
      id,
    } as Api<E, K, Identified, Meta>
  }

  return {
    getRef,
    element,
    meta,
  } as Api<E, K, Identified, Meta>
}

function toListOrder<Item extends SupportedElement | Record<any, any>> (
  itemsA: Item[],
  itemsB: Item[],
  isEqual: (itemA: Item, itemB: Item) => boolean
) {
  for (let i = 0; i < itemsA.length; i++) {
    if (!itemsA[i] || !itemsB[i]) continue
    if (!isEqual(itemsA[i], itemsB[i])) return 'changed'
  }

  return 'none'
}

function toPlaneOrder<Item extends SupportedElement | Record<any, any>> (
  itemsA: Plane<Item>,
  itemsB: Plane<Item>,
  isEqual: (itemA: Item, itemB: Item) => boolean
) {
  for (let row = 0; row < itemsA.length; row++) {
    for (let column = 0; column < itemsA.length; column++) {
      if (!itemsA[row]?.[column] || !itemsB[row]?.[column]) continue
      if (!isEqual(itemsA[row][column], itemsB[row][column])) return 'changed'
    }
  }

  return 'none'
}
