import type { Ref } from 'vue'
import { useListIdentifieds } from '../extracted'

export type ListDescriptions = { roots: ReturnType<typeof useListIdentifieds> }

export function useListDescriptions (elements: Ref<HTMLElement[]>): ListDescriptions {
  return {
    roots: useListIdentifieds({
      identifying: elements,
      attribute: 'ariaDescribedby',
    }),
  }
}
