import { ref, shallowRef, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './ensureReactivePlaneFromAffordanceElement'

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

export type IdentifiedPlaneApi<E extends SupportedElement> = PlaneApi<E> & { ids: Id<Ref<Map<number, E[]>>> }
export type IdentifiedListApi<E extends SupportedElement> = ListApi<E> & { ids: Id<Ref<E[]>> }
export type IdentifiedElementApi<E extends SupportedElement> = ElementApi<E> & { id: Id<Ref<E>> }

// TODO: Irregular planes
export type PlaneApi<E extends SupportedElement> = {
  getRef: (column: number, row: number) => (el: E) => any,
  elements: Ref<Map<number, E[]>>,
  status: Ref<{
    byRow: { order: 'changed' | 'none' | 'n/a', length: 'shortened' | 'lengthened' | 'none' | 'n/a' }[],
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
    const elements: Api<E, 'plane', false>['elements'] = shallowRef(new Map()),
          getFunctionRef: Api<E, 'plane', false>['getRef'] = (column, row) => newElement => {
            if (!elements.value.get(row)) elements.value.set(row, [])
            if (newElement) elements.value.get(row)[column] = newElement
          },
          status: Api<E, 'plane', false>['status'] = shallowRef({ byRow: [] })

    onBeforeUpdate(() => (elements.value = new Map()))

    watch(
      elements,
      (current, previous) => {
        const byRow: Api<E, 'plane', false>['status']['value']['byRow'] = []

        for (let row = 0; row < current.size; row++) {
          const length = (() => {
            if (!previous.get(row)) return 'n/a'
            if (current.get(row).length > previous.get(row).length) return 'lengthened'
            if (current.get(row).length < previous.get(row).length) return 'shortened'
            return 'none'
          })()
          
          const order = (() => {
            if (length === 'n/a') return 'n/a'

            if (length === 'lengthened') {
              for (let column = 0; column < previous.get(row).length; column++) {
                if (!previous.get(row)[column].isSameNode(current.get(row)[column])) return 'changed'
              }
    
              return 'none'
            }
  
            for (let column = 0; column < current.get(row).length; column++) {
              if (!current.get(row)[column].isSameNode(previous.get(row)[column])) return 'changed'
            }
  
            return 'none'
          })()

          byRow.push({ length, order })
        }

        status.value = { byRow }
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
