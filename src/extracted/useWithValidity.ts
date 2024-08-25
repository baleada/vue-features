import { shallowRef } from 'vue'
import { bind } from '../affordances'
import { onRendered } from './onRendered'
import { toValidityBindValues } from './toValidityBindValues'
import type { ValidityMeta } from './toValidityBindValues'
import type { ElementApi } from './useElementApi'

export type WithValidity = {
  is: {
    valid: () => boolean,
    invalid: () => boolean,
  }
}

export function useWithValidity (api: ElementApi<HTMLElement, true, ValidityMeta>): WithValidity {
  const isValid = shallowRef(false),
        isInvalid = shallowRef(false)

  bind(
    api.element,
    toValidityBindValues(api)
  )

  onRendered(
    api.meta,
    {
      predicateRenderedWatchSourcesChanged: ([currentMeta], [previousMeta]) => (
        currentMeta.validity !== previousMeta?.validity
      ),
      effect: () => {
        isValid.value = !api.meta.value.validity || api.meta.value.validity === 'valid'
        isInvalid.value = api.meta.value.validity === 'invalid'
      },
    }
  )

  return {
    is: {
      valid: () => isValid.value,
      invalid: () => isInvalid.value,
    },
  }
}
