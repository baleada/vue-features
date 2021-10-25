import type { Textbox } from '../interfaces'
import { bind, show } from '../affordances'
import type { BindValueGetterWithWatchSources } from '../affordances'
import {
  useIdentified,
  ensureGetStatus,
  ensureWatchSourcesFromStatus
} from '../extracted'
import type { BindValue } from '../extracted'

export type ErrorMessage = { root: ReturnType<typeof useIdentified> }

export type UseErrorMessageOptions = {
  validity?: BindValue<'valid' | 'invalid'> | BindValueGetterWithWatchSources<'valid' | 'invalid'>,
}

const defaultOptions: UseErrorMessageOptions = {
  validity: 'valid',
}

export function useErrorMessage (textbox: Textbox, options: UseErrorMessageOptions = {}): ErrorMessage {
  const { validity } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useIdentified({
    identifying: textbox.root.element,
    attribute: 'ariaErrormessage'
  })


  // BASIC BINDINGS
  const ensuredGetValidity = ensureGetStatus({ element: root.element, status: validity })
  
  bind({
    element: textbox.root.element,
    values: {
      ariaInvalid: {
        get: () => ensuredGetValidity() === 'invalid' ? 'true' : undefined,
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
      get: () => ensuredGetValidity() === 'invalid',
      watchSources: [
        () => textbox.text.value.string,
        ...ensureWatchSourcesFromStatus(validity),
      ],
    }
  })


  // API
  return { root }
}
