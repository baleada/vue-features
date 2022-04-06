import { ref, shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import { Plane } from './ensureReactivePlane'
import type { SupportedElement } from './ensureReactivePlane'

export type Api<E extends SupportedElement, K extends Kind, Identified extends boolean> = K extends 'plane'
  ? Identified extends true
    ? IdentifiedPlaneApi<E>
    : PlaneApi<E>
  : K extends 'list'
    ? Identified extends true
      ? IdentifiedListApi<E>
      : ListApi<E>
    : Identified extends true
      ? IdentifiedElementApi<E>
      : ElementApi<E>

export type Kind = 'element' | 'list' | 'plane'

export type IdentifiedPlaneApi<E extends SupportedElement> = PlaneApi<E> & { ids: Id<Ref<Plane<E>>> }
export type IdentifiedListApi<E extends SupportedElement> = ListApi<E> & { ids: Id<Ref<E[]>> }
export type IdentifiedElementApi<E extends SupportedElement> = ElementApi<E> & { id: Id<Ref<E>> }

// TODO: Irregular planes
export type PlaneApi<E extends SupportedElement> = {
  getRef: (row: number, column: number) => (el: E) => any,
  elements: Ref<Plane<E>>,
  status: Ref<{
    order: 'changed' | 'none',
    rowLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual rows
    columnLength: 'shortened' | 'lengthened' | 'none' | 'n/a', // Length of individual columns
  }>,
}

export type ListApi<E extends SupportedElement> = {
  getRef: (index: number) => (el: E) => any,
  elements: Ref<E[]>,
  status: Ref<{ order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' }>,
}

export type ElementApi<E extends SupportedElement> = {
  ref: (el: E) => any,
  element: Ref<null | E>,
}

export type UseElementOptions<K extends Kind, Identified extends boolean> = {
  kind?: K,
  identified?: Identified
}

const defaultOptions: UseElementOptions<'element', false> = {
  kind: 'element',
  identified: false, 
}

export function useElementApi<
  E extends SupportedElement,
  K extends Kind = 'element',
  Identified extends boolean = false,
> (options: UseElementOptions<K, Identified> = {}): Api<E, K, Identified> {
  const { kind, identified } = { ...defaultOptions, ...options }

  if (kind === 'plane') {
    const elements: Api<E, 'plane', false>['elements'] = shallowRef(new Plane()),
          getFunctionRef: Api<E, 'plane', false>['getRef'] = (row, column) => newElement => {
            if (newElement) {
              if (!elements.value[row]) elements.value[row] = []
              elements.value[row][column] = newElement
            }
          },
          status: Api<E, 'plane', false>['status'] = shallowRef({ order: 'none', rowLength: 'none', columnLength: 'none' } as const)

    onBeforeUpdate(() => (elements.value = new Plane()))

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
        status,
        ids,
      } as Api<E, K, Identified>
    }

    return {
      getRef: getFunctionRef,
      elements,
      status,
    } as Api<E, K, Identified>
  }

  if (kind === 'list') {
    const elements: Api<E, 'list', false>['elements'] = shallowRef([]),
          getFunctionRef: Api<E, 'list', false>['getRef'] = index => newElement => {
            if (newElement) elements.value[index] = newElement
          },
          status: Api<E, 'list', false>['status'] = shallowRef({ order: 'none' as const, length: 'none' as const })

    onBeforeUpdate(() => (elements.value = []))

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
        status,
        ids,
      } as Api<E, K, Identified>
    }

    return {
      getRef: getFunctionRef,
      elements,
      status,
    } as Api<E, K, Identified>
  }

  const element: Api<E, 'element', false>['element'] = ref(null),
        functionRef: Api<E, 'element', false>['ref'] = newElement => (element.value = newElement)

  if (identified) {
    const id = identify(element)
    
    return {
      ref: functionRef,
      element,
      id,
    } as Api<E, K, Identified>
  }

  return {
    ref: functionRef,
    element,
  } as Api<E, K, Identified>
}
