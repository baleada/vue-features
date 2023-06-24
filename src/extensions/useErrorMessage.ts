import type { Ref } from 'vue'
import type { Textbox } from '../interfaces'
import { show } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useIdentified,
  narrowElement,
} from '../extracted'

export type ErrorMessage = { root: ReturnType<typeof useIdentified> }

export type UseErrorMessageOptions = {
  transition?: {
    errorMessage?: TransitionOption<Ref<HTMLElement>>,
  },
}

const defaultOptions: UseErrorMessageOptions = {}

export function useErrorMessage (textbox: Textbox | Ref<HTMLInputElement | HTMLTextAreaElement>, options: UseErrorMessageOptions = {}): ErrorMessage {
  const element = narrowElement(textbox),
        { transition } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useIdentified({
    identifying: element,
    attribute: 'ariaDescribedbys',
    identified: {
      defaultMeta: { validity: 'valid' },
    },
  })


  // BASIC BINDINGS
  show(
    root.element,
    () => root.meta.value?.validity === 'invalid',
    { transition: transition?.errorMessage }
  )


  // API
  return { root }
}
