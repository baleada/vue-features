import type { BindReactiveValueGetter } from '../affordances'
import type { SupportedElement } from './toRenderedKind'
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
    ElementApi<SupportedElement, any, ValidityMeta>['element'],
    boolean
  >
>

export function toValidityBindValues(elementApi: ElementApi<SupportedElement, any, ValidityMeta>): ValidityBindValues {
  return {
    ariaInvalid: {
      get: () => (
        (elementApi as ElementApi<SupportedElement, true, ValidityMeta>)
          .meta
          .value
          .validity === 'invalid'
            ? true : undefined
      ),
      watchSource: elementApi.meta,
    },
  }
}
