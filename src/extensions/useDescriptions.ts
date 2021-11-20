import type { Ref } from 'vue'
import { useIdentifieds } from '../extracted'

export type Descriptions = { roots: ReturnType<typeof useIdentifieds> }

export function useDescriptions (elements: Ref<HTMLElement[]>): Descriptions {
  return {
    roots: useIdentifieds({
      identifying: elements,
      attribute: 'ariaDescribedby'
    })
  }
}
