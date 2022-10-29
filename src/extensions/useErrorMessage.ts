import { Ref } from 'vue'
import type { Textbox } from '../interfaces'
import { show } from '../affordances'
import type { TransitionOption } from '../affordances'
import {
  useIdentified,
  ensureElementFromExtendable,
} from '../extracted'

export type ErrorMessage = { root: ReturnType<typeof useIdentified> }

export type UseErrorMessageOptions = {
  transition?: {
    errorMessage?: TransitionOption<Ref<HTMLElement>>,
  },
}

const defaultOptions: UseErrorMessageOptions = {}

export function useErrorMessage (textbox: Textbox | Ref<HTMLInputElement | HTMLTextAreaElement>, options: UseErrorMessageOptions = {}): ErrorMessage {
  const element = ensureElementFromExtendable(textbox),
        { transition } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useIdentified({
    identifying: element,
    attribute: 'ariaErrormessage',
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
