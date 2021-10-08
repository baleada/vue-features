import { ref, computed, onBeforeUpdate } from 'vue'
import type { Ref } from 'vue'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './ensureElementsFromAffordanceElement'

export type ElementApi<ElementType extends SupportedElement, Type extends 'single' | 'multiple',  Identified extends boolean> = Type extends 'single'
  ? SingleElement<ElementType, Identified>
  : MultipleElements<ElementType, Identified>

type SingleElement<ElementType extends SupportedElement, Identified extends boolean> = {
  ref: (el: ElementType) => any,
  element: Ref<null | ElementType>,
} & (Identified extends true ? { id: Id<Ref<ElementType>> } : Record<never, never>)

type MultipleElements<ElementType extends SupportedElement, Identified extends boolean> = {
  getRef: (index: number) => (el: ElementType) => any,
  elements: Ref<(null | ElementType)[]>,
} & (Identified extends true ? { ids: Id<Ref<ElementType[]>> } : Record<never, never>)

export type UseElementOptions<Type extends 'single' | 'multiple', Identified extends boolean> = {
  type?: Type,
  identified?: Identified
}

const defaultOptions: UseElementOptions<'single', false> = {
  type: 'single',
  identified: false,
}

export function useElementApi<
  ElementType extends SupportedElement,
  Type extends 'single' | 'multiple',
  Identified extends boolean,
> (options: UseElementOptions<Type, Identified> = {}): ElementApi<ElementType, Type, Identified> {
  const { type, identified } = { ...defaultOptions, ...options }

  if (type === 'single') {
    const element: ElementApi<ElementType, 'single', true>['element'] = ref(null),
          functionRef: ElementApi<ElementType, 'single', true>['ref'] = newElement => (element.value = newElement)

    if (identified) {
      const id = identify({ element })
      
      return {
        ref: functionRef,
        element,
        id,
      } as unknown as ElementApi<ElementType, Type, Identified>
    }

    return {
      ref: functionRef,
      element,
    } as ElementApi<ElementType, Type, Identified>
  }

  const elements: Ref<(null | ElementType)[]> = ref([]),
        getFunctionRef = (index: number) => (newElement: ElementType) => {
          if (newElement) elements.value[index] = newElement
        }

  onBeforeUpdate(() => (elements.value = []))

  if (identified) {
    const ids = identify({ element: elements })
    
    return {
      getRef: getFunctionRef,
      elements,
      ids,
    } as unknown as ElementApi<ElementType, Type, Identified>
  }

  return {
    getRef: getFunctionRef,
    elements,
  } as ElementApi<ElementType, Type, Identified>
}
