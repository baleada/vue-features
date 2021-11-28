import { ref, onBeforeUpdate, watch } from 'vue'
import type { Ref } from 'vue'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './ensureElementsFromAffordanceElement'

export type ElementApi<ElementType extends SupportedElement, Multiple extends boolean, Identified extends boolean> = Multiple extends true
  ? Identified extends true
    ? MultipleIdentifiedElementsApi<ElementType>
    : MultipleElementsApi<ElementType>
  : Identified extends true
    ? SingleIdentifiedElementApi<ElementType>
    : SingleElementApi<ElementType>

export type MultipleIdentifiedElementsApi<ElementType extends SupportedElement> = MultipleElementsApi<ElementType> & { ids: Id<Ref<ElementType[]>> }
export type SingleIdentifiedElementApi<ElementType extends SupportedElement> = SingleElementApi<ElementType> & { id: Id<Ref<ElementType>> }

export type MultipleElementsApi<ElementType extends SupportedElement> = {
  getRef: (index: number) => (el: ElementType) => any,
  elements: Ref<ElementType[]>,
  status: Ref<{ order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' }>,
}

export type SingleElementApi<ElementType extends SupportedElement> = {
  ref: (el: ElementType) => any,
  element: Ref<null | ElementType>,
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
  ElementType extends SupportedElement,
  Multiple extends boolean = false,
  Identified extends boolean = false,
> (options: UseElementOptions<Multiple, Identified> = {}): ElementApi<ElementType, Multiple, Identified> {
  const { multiple, identified } = { ...defaultOptions, ...options }

  if (multiple) {
    const elements: ElementApi<ElementType, true, false>['elements'] = ref([]),
          getFunctionRef: ElementApi<ElementType, true, false>['getRef'] = index => newElement => {
            if (newElement) elements.value[index] = newElement
          },
          status: ElementApi<ElementType, true, false>['status'] = ref({ order: 'none' as const, length: 'none' as const })

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
          for (let i = 0; i < current.length; i++) {
            if (!current[i].isSameNode(previous[i])) return 'changed'
          }

          return 'none'
        })()

        status.value = { order, length }
      }
    )

    if (identified) {
      const ids = identify({ element: elements })

      return {
        getRef: getFunctionRef,
        elements,
        status,
        ids,
      } as ElementApi<ElementType, Multiple, Identified>
    }

    return {
      getRef: getFunctionRef,
      elements,
      status,
    } as ElementApi<ElementType, Multiple, Identified>
  }

  const element: ElementApi<ElementType, false, false>['element'] = ref(null),
        functionRef: ElementApi<ElementType, false, false>['ref'] = newElement => (element.value = newElement)

  if (identified) {
    const id = identify({ element })
    
    return {
      ref: functionRef,
      element,
      id,
    } as ElementApi<ElementType, Multiple, Identified>
  }

  return {
    ref: functionRef,
    element,
  } as ElementApi<ElementType, Multiple, Identified>
}
