import type { Ref } from 'vue'
import type { Textbox } from '../interfaces'
import { bind, show } from '../affordances'
import type { BindReactiveValueGetter, TransitionOption } from '../affordances'
import {
  useIdentified,
  ensureGetStatus,
  ensureWatchSourcesFromStatus,
  ensureElementFromExtendable
} from '../extracted'
import type { StatusOption } from '../extracted'

export type ErrorMessage = { root: ReturnType<typeof useIdentified> }

export type UseErrorMessageOptions = {
  validity?: StatusOption<'valid' | 'invalid'>,
  transition?: {
    errorMessage?: TransitionOption,
  }
}

const defaultOptions: UseErrorMessageOptions = {
  validity: () => 'valid',
}

export function useErrorMessage (textbox: Textbox | Ref<HTMLInputElement | HTMLTextAreaElement>, options: UseErrorMessageOptions = {}): ErrorMessage {
  const element = ensureElementFromExtendable(textbox),
        { validity, transition } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useIdentified({
    identifying: element,
    attribute: 'ariaErrormessage'
  })


  // BASIC BINDINGS
  const getValidity = ensureGetStatus({ element: root.element, status: validity })
  
  bind({
    element,
    values: {
      ariaInvalid: {
        get: () => getValidity() === 'invalid' ? 'true' : undefined,
        watchSource: ensureWatchSourcesFromStatus(validity),
      }
    }
  })

  show({
    element: root.element,
    condition: {
      get: () => getValidity() === 'invalid',
      watchSource: ensureWatchSourcesFromStatus(validity),
    }
  }, { transition: transition?.errorMessage })


  // API
  return { root }
}
