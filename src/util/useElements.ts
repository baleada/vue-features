import { ref, onBeforeUpdate, onMounted, onUpdated } from 'vue'
import type { Ref } from 'vue'

export type SupportedElement = Element | Document | (Window & typeof globalThis)

export type SingleElement<ElementType extends SupportedElement> = {
  ref: (el: ElementType) => any,
  element: Ref<null | ElementType>,
}

export function useSingleElement<ElementType extends SupportedElement> (): SingleElement<ElementType> {
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

export function useMultipleElements<ElementType extends SupportedElement> (options: { effect?: () => any } = {}): MultipleElements<ElementType> {
  const { effect } = options

  const elements: Ref<(null | ElementType)[]> = ref([]),
        getFunctionRef = (index: number) => (newElement: ElementType) => {
          if (newElement) elements.value[index] = newElement
        }

  onBeforeUpdate(() => (elements.value = []))

  onMounted(() => effect?.())
  onUpdated(() => effect?.())

  return {
    getRef: getFunctionRef,
    elements,
  }
}
