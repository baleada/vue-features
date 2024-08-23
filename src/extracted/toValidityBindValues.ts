import type { BindReactiveValueGetter } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { Validity } from './validity'

export type ValidityMeta = {
  validity?: Validity,
}

export const defaultValidityMeta: ValidityMeta = {
  validity: 'valid',
}

type ValidityBindValues = Record<
  (
    | 'ariaInvalid'
  ),
  BindReactiveValueGetter<
    ElementApi<HTMLElement, any, ValidityMeta>['element'],
    boolean
  >
>

export function toValidityBindValues(elementApi: ElementApi<HTMLElement, any, ValidityMeta>): ValidityBindValues {
  return {
    ariaInvalid: {
      get: () => (
        (elementApi as ElementApi<HTMLElement, true, ValidityMeta>)
          .meta
          .value
          .validity === 'invalid'
            ? true : undefined
      ),
      watchSource: elementApi.meta,
    },
  }
}
