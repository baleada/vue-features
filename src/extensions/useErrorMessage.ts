import type { Textbox } from '../interfaces'
import { bind, show } from '../affordances'
import type { BindValueGetterWithWatchSources, TransitionOption } from '../affordances'
import {
  useIdentified,
  ensureGetStatus,
  ensureWatchSourcesFromStatus
} from '../extracted'
import type { BindValue } from '../extracted'

export type ErrorMessage = { root: ReturnType<typeof useIdentified> }

export type UseErrorMessageOptions = {
  validity?: BindValue<'valid' | 'invalid'> | BindValueGetterWithWatchSources<'valid' | 'invalid'>,
  transition?: {
    errorMessage?: TransitionOption,
  }
}

const defaultOptions: UseErrorMessageOptions = {
  validity: 'valid',
}

export function useErrorMessage (textbox: Textbox, options: UseErrorMessageOptions = {}): ErrorMessage {
  const { validity, transition } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useIdentified({
    identifying: textbox.root.element,
    attribute: 'ariaErrormessage'
  })


  // BASIC BINDINGS
  const geValidity = ensureGetStatus({ element: root.element, status: validity })
  
  bind({
    element: textbox.root.element,
    values: {
      ariaInvalid: {
        get: () => geValidity() === 'invalid' ? 'true' : undefined,
        watchSources: [
          () => textbox.text.value.string,
          ...ensureWatchSourcesFromStatus(validity),
        ],
      }
    }
  })

  show({
    element: root.element,
    condition: {
      get: () => geValidity() === 'invalid',
      watchSources: [
        () => textbox.text.value.string,
        ...ensureWatchSourcesFromStatus(validity),
      ],
    }
  }, { transition: transition?.errorMessage })


  // API
  return { root }
}
