import { ref, onBeforeUpdate } from 'vue'
import type { Ref } from 'vue'

export type SupportedElement = HTMLElement | Document | (Window & typeof globalThis)

export type SingleElement<ElementType extends SupportedElement> = {
  ref: (el: ElementType) => any,
  element: Ref<null | ElementType>,
}

export function useSingleElement<ElementType extends SupportedElement = HTMLElement> (): SingleElement<ElementType> {
  const element: Ref<null | ElementType> = ref(null),
        functionRef = (newElement: ElementType) => (element.value = newElement)

  return {
    ref: functionRef,
    element,
  }
}

export type MultipleElements<ElementType extends SupportedElement> = {
  getRef: (index: number) => (el: ElementType) => any,
  elements: Ref<(null | ElementType)[]>,
}

export function useMultipleElements<ElementType extends SupportedElement = HTMLElement> (): MultipleElements<ElementType> {
  const elements: Ref<(null | ElementType)[]> = ref([]),
        getFunctionRef = (index: number) => (newElement: ElementType) => {
          if (newElement) elements.value[index] = newElement
        }

  onBeforeUpdate(() => (elements.value = []))

  return {
    getRef: getFunctionRef,
    elements,
  }
}