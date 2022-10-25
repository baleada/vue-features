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

// TODO: Irregular planes. Maybe meta is the solution?
export type PlaneApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = {
  getRef: (row: number, column: number, meta?: Meta) => (el: E) => any,
  elements: Ref<Plane<E>>,
  status: Ref<{
    order: 'changed' | 'none',
    rowLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual rows
    columnLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual columns
  }>,
  meta: Ref<Plane<Meta>>,
}

export type ListApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = {
  getRef: (index: number, meta?: Meta) => (el: E) => any,
  elements: Ref<E[]>,
  status: Ref<{ order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' }>,
  meta: Ref<Meta[]>,
}

export type ElementApi<E extends SupportedElement, Meta extends Record<any, any> = {}> = {
  ref: (el: E, meta?: Meta) => any,
  element: Ref<null | E>,
  meta: Ref<Meta>,
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
          getFunctionRef: Api<E, 'plane', false, {}>['getRef'] = (row, column, m) => newElement => {
            if (newElement) {
              (elements.value[row] || (elements.value[row] = []))[column] = newElement
              if (m) (meta.value[row] || (meta.value[row] = []))[column] = { ...defaultMeta, ...m }
            }
          },
          status: Api<E, 'plane', false, {}>['status'] = shallowRef({ order: 'none', rowLength: 'none', columnLength: 'none' } as const)

    onBeforeUpdate(() => {
      elements.value = new Plane()
      meta.value = new Plane()
    })

    watch(
      elements,
      (current, previous) => {
        const rowLength = (() => {
          if (current.length === 0) return 'n/a'
          if (current[0].length > previous[0].length) return 'lengthened'
          if (current[0].length < previous[0].length) return 'shortened'
          return 'none'
        })()

        const columnLength = (() => {
          if (current.length > previous.length) return 'lengthened'
          if (current.length < previous.length) return 'shortened'
          return 'none'
        })()

        const order = (() => {
          for (let row = 0; row < current.length; row++) {
            for (let column = 0; column < current.length; column++) {
              if (!current[row]?.[column] || !previous[row]?.[column]) continue
              if (!current[row][column].isSameNode(previous[row][column])) return 'changed'
            }
          }

          return 'none'
        })()

        status.value = { order, rowLength, columnLength }
      },
      { flush: 'post' }
    )

    if (identified) {
      const ids = identify(elements)

      return {
        getRef: getFunctionRef,
        elements,
        meta,
        status,
        ids,
      } as Api<E, K, Identified, Meta>
    }

    return {
      getRef: getFunctionRef,
      elements,
      meta,
      status,
    } as Api<E, K, Identified, Meta>
  }

  if (kind === 'list') {
    const elements: Api<E, 'list', false, {}>['elements'] = shallowRef([]),
          meta: Api<E, 'list', false, {}>['meta'] = shallowRef([]),
          getFunctionRef: Api<E, 'list', false, {}>['getRef'] = (index, m) => newElement => {
            if (newElement) {
              elements.value[index] = newElement
              if (m) meta.value[index] = { ...defaultMeta, ...m }
            }
          },
          status: Api<E, 'list', false, {}>['status'] = shallowRef({ order: 'none' as const, length: 'none' as const })

    onBeforeUpdate(() => {
      elements.value = []
      meta.value = []
    })

    watch(
      elements,
      (current, previous) => {
        const length = (() => {
          if (current.length > previous.length) return 'lengthened'
          if (current.length < previous.length) return 'shortened'
          return 'none'
        })()

        const order = (() => {
          if (length === 'lengthened') {
            for (let i = 0; i < previous.length; i++) {
              if (!previous[i].isSameNode(current[i])) return 'changed'
            }
  
            return 'none'
          }

          for (let i = 0; i < current.length; i++) {
            if (!current[i].isSameNode(previous[i])) return 'changed'
          }

          return 'none'
        })()

        status.value = { order, length }
      },
      { flush: 'post' }
    )

    if (identified) {
      const ids = identify(elements)

      return {
        getRef: getFunctionRef,
        elements,
        meta,
        status,
        ids,
      } as Api<E, K, Identified, Meta>
    }

    return {
      getRef: getFunctionRef,
      elements,
      meta,
      status,
    } as Api<E, K, Identified, Meta>
  }

  const element: Api<E, 'element', false, {}>['element'] = ref(null),
        meta: Api<E, 'element', false, {}>['meta'] = ref(defaultMeta),
        functionRef: Api<E, 'element', false, {}>['ref'] = (newElement, m) => {
          if (newElement) {
            element.value = newElement
            if (m) meta.value = { ...defaultMeta, ...m }
          }
        }

  if (identified) {
    const id = identify(element)
    
    return {
      ref: functionRef,
      element,
      meta,
      id,
    } as Api<E, K, Identified, Meta>
  }

  return {
    ref: functionRef,
    element,
    meta,
  } as Api<E, K, Identified, Meta>
}
