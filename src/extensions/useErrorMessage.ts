import type { Textbox } from '../interfaces'
import { bind, show } from '../affordances'
import type { BindValueGetterObject } from '../affordances'
import {
  useIdentified,
  ensureGetStatus,
  ensureWatchSourcesFromGetStatus
} from '../extracted'
import type { BindValue } from '../extracted'

export type ErrorMessage = { root: ReturnType<typeof useIdentified> }

export type UseErrorMessageOptions = {
  validity?: BindValue<'valid' | 'invalid'> | BindValueGetterObject<'valid' | 'invalid'>,
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
  const ensuredGetValidity = ensureGetStatus({ element: root.element, getStatus: validity })
  
  bind({
    element: textbox.root.element,
    values: {
      ariaInvalid: {
        getValue: () => ensuredGetValidity() === 'invalid' ? 'true' : undefined,
        watchSources: [
          () => textbox.text.value.string,
          ...ensureWatchSourcesFromGetStatus(validity),
        ],
      }
    }
  })

  show({
    element: root.element,
    condition: {
      getValue: () => ensuredGetValidity() === 'invalid',
      watchSources: [
        () => textbox.text.value.string,
        ...ensureWatchSourcesFromGetStatus(validity),
      ],
    }
  })


  // API
  return { root }
}
