import type { Ref } from 'vue'
import { useListIdentified } from '../extracted'

export type Descriptions = { roots: ReturnType<typeof useListIdentified> }

export function useDescriptions (elements: Ref<HTMLElement[]>): Descriptions {
  return {
    roots: useListIdentified({
      identifying: elements,
      attribute: 'ariaDescribedby'
    })
  }
}
