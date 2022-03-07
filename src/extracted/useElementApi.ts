import { ref, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { Pipeable, createMap, createFilter } from '@baleada/logic'
import { max } from 'lazy-collections'
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

export type IdentifiedPlaneApi<E extends SupportedElement> = PlaneApi<E> & { ids: Id<Ref<E[][]>> }
export type IdentifiedListApi<E extends SupportedElement> = ListApi<E> & { ids: Id<Ref<E[]>> }
export type IdentifiedElementApi<E extends SupportedElement> = ElementApi<E> & { id: Id<Ref<E>> }

// TODO: Irregular planes
export type PlaneApi<E extends SupportedElement> = {
  getRef: (column: number, row: number) => (el: E) => any,
  elements: Ref<[[row: number, column: number], E][]>,
  status: Ref<{
    rows: { order: 'changed' | 'none' | 'n/a', length: 'shortened' | 'lengthened' | 'none' | 'n/a' }[],
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
    const elements: Api<E, 'plane', false>['elements'] = ref([]),
          meta = { columns: 0 },
          getFunctionRef: Api<E, 'plane', false>['getRef'] = (column, row) => newElement => {
            if (row === 0 && column > meta.columns - 1) meta.columns = column + 1
            if (newElement) elements.value[(row * meta.columns) + column] = [[row, column], newElement]
          },
          status: Api<E, 'plane', false>['status'] = ref({  length: 'none' as const, rows: [] })

    onBeforeUpdate(() => (elements.value = []))

    watch(
      elements,
      (current, previous) => {
        const rows: Api<E, 'plane', false>['status']['value']['rows'] = []

        const currentMaxRow = toMaxRow(current),
              previousMaxRow = toMaxRow(previous)

        for (let row = 0; row <= currentMaxRow; row++) {
          const currentRow = createFilter<typeof current[0]>(([[r]]) => r === row)(current),
                previousRow = row > previousMaxRow
                  ? []
                  : createFilter<typeof current[0]>(([[r]]) => r === row)(previous)

          const length = (() => {
            if (row > previousMaxRow) return 'n/a'
            if (currentRow.length > previousRow.length) return 'lengthened'
            if (currentRow.length < previousRow.length) return 'shortened'
            return 'none'
          })()
          
          const order = (() => {
            if (length === 'n/a') return 'n/a'

            if (length === 'lengthened') {
              for (let column = 0; column < previousRow.length; column++) {
                if (!previousRow[column][1].isSameNode(currentRow[column][1])) return 'changed'
              }
    
              return 'none'
            }
  
            for (let column = 0; column < currentRow.length; column++) {
              if (!currentRow[column][1].isSameNode(previousRow[column][1])) return 'changed'
            }
  
            return 'none'
          })()

          rows.push({ length, order })
        }

        status.value = { rows }
      },
      { flush: 'post' }
    )

    // if (identified) {
    //   const ids = identify(elements)

    //   return {
    //     getRef: getFunctionRef,
    //     elements,
    //     status,
    //     ids,
    //   } as Api<E, K, Identified>
    // }

    return {
      getRef: getFunctionRef,
      elements,
      status,
    } as Api<E, K, Identified>
  }

  if (kind === 'list') {
    const elements: Api<E, 'list', false>['elements'] = ref([]),
          getFunctionRef: Api<E, 'list', false>['getRef'] = index => newElement => {
            if (newElement) elements.value[index] = newElement
          },
          status: Api<E, 'list', false>['status'] = ref({ order: 'none' as const, length: 'none' as const })

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

function toMaxRow<E extends SupportedElement> (elements: PlaneApi<E>['elements']['value']): number {
  return new Pipeable(elements).pipe(
    createMap<typeof elements[0], number>(([[row]]) => row),
    max(),
  )
}
