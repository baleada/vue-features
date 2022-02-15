import { ref, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './ensureReactiveMultipleFromAffordanceElement'

export type ElementApi<E extends SupportedElement, Multiple extends boolean, Identified extends boolean> = Multiple extends true
  ? Identified extends true
    ? MultipleIdentifiedElementsApi<E>
    : MultipleElementsApi<E>
  : Identified extends true
    ? SingleIdentifiedElementApi<E>
    : SingleElementApi<E>

export type MultipleIdentifiedElementsApi<E extends SupportedElement> = MultipleElementsApi<E> & { ids: Id<Ref<E[]>> }
export type SingleIdentifiedElementApi<E extends SupportedElement> = SingleElementApi<E> & { id: Id<Ref<E>> }

export type MultipleElementsApi<E extends SupportedElement> = {
  getRef: (index: number) => (el: E) => any,
  elements: Ref<E[]>,
  status: Ref<{ order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' }>,
}

export type SingleElementApi<E extends SupportedElement> = {
  ref: (el: E) => any,
  element: Ref<null | E>,
}

export type UseElementOptions<Multiple extends boolean, Identified extends boolean> = {
  multiple?: Multiple,
  identified?: Identified
}

const defaultOptions: UseElementOptions<false, false> = {
  multiple: false,
  identified: false, 
}

export function useElementApi<
  E extends SupportedElement,
  Multiple extends boolean = false,
  Identified extends boolean = false,
> (options: UseElementOptions<Multiple, Identified> = {}): ElementApi<E, Multiple, Identified> {
  const { multiple, identified } = { ...defaultOptions, ...options }

  if (multiple) {
    const elements: ElementApi<E, true, false>['elements'] = ref([]),
          getFunctionRef: ElementApi<E, true, false>['getRef'] = index => newElement => {
            if (newElement) elements.value[index] = newElement
          },
          status: ElementApi<E, true, false>['status'] = ref({ order: 'none' as const, length: 'none' as const })

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
      } as ElementApi<E, Multiple, Identified>
    }

    return {
      getRef: getFunctionRef,
      elements,
      status,
    } as ElementApi<E, Multiple, Identified>
  }

  const element: ElementApi<E, false, false>['element'] = ref(null),
        functionRef: ElementApi<E, false, false>['ref'] = newElement => (element.value = newElement)

  if (identified) {
    const id = identify(element)
    
    return {
      ref: functionRef,
      element,
      id,
    } as ElementApi<E, Multiple, Identified>
  }

  return {
    ref: functionRef,
    element,
  } as ElementApi<E, Multiple, Identified>
}
