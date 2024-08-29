import type { BindReactiveValueGetter } from '../affordances'
import { Plane } from './plane'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import type { PlaneApi } from './usePlaneApi'
import type { Ability } from './ability'
import type { SupportedElement } from './toRenderedKind'

export type AbilityMeta = {
  ability?: Ability,
}

export const defaultAbilityMeta: AbilityMeta = {
  ability: 'enabled',
}

type AbilityBindValues<
  Api extends (
    | PlaneApi<SupportedElement, any, AbilityMeta>
    | ListApi<SupportedElement, any, AbilityMeta>
    | ElementApi<SupportedElement, any, AbilityMeta>
  )
> = Record<
  (
    | 'disabled'
    | 'ariaDisabled'
    | 'tabindex'
  ),
  BindReactiveValueGetter<
    Api extends PlaneApi<SupportedElement, any, AbilityMeta> ? PlaneApi<SupportedElement, any, AbilityMeta>['plane'] :
    Api extends ListApi<SupportedElement, any, AbilityMeta> ? ListApi<SupportedElement, any, AbilityMeta>['list'] :
    ElementApi<SupportedElement, any, AbilityMeta>['element'],
    boolean | number | null | string
  >
>

export function toAbilityBindValues<
  Api extends (
    | PlaneApi<SupportedElement, any, AbilityMeta>
    | ListApi<SupportedElement, any, AbilityMeta>
    | ElementApi<SupportedElement, any, AbilityMeta>
  )
> (elementOrListOrPlaneApi: Api): AbilityBindValues<Api> {
  if (elementOrListOrPlaneApi.meta.value instanceof Plane) {
    return {
      disabled: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<SupportedElement, true, AbilityMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.ability === 'disabled'
              ? true: undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDisabled: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<SupportedElement, true, AbilityMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.ability === 'disabled'
              ? true: undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      tabindex: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<SupportedElement, true, AbilityMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.ability === 'enabled'
              ? 0: -1
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
    } as AbilityBindValues<Api>
  }

  if (Array.isArray(elementOrListOrPlaneApi.meta.value)) {
    return {
      disabled: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<SupportedElement, true, AbilityMeta>)
            .meta
            .value
            ?.[index]
            ?.ability === 'disabled'
              ? true: undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDisabled: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<SupportedElement, true, AbilityMeta>)
            .meta
            .value
            ?.[index]
            ?.ability === 'disabled'
              ? true: undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      tabindex: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<SupportedElement, true, AbilityMeta>)
            .meta
            .value
            ?.[index]
            ?.ability === 'enabled'
              ? 0: -1
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
    } as AbilityBindValues<Api>
  }

  return {
    disabled: {
      get: () => (
        (elementOrListOrPlaneApi as ElementApi<SupportedElement, true, AbilityMeta>)
          .meta
          .value
          .ability === 'disabled'
            ? true: undefined
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
    ariaDisabled: {
      get: () => (
        (elementOrListOrPlaneApi as ElementApi<SupportedElement, true, AbilityMeta>)
          .meta
          .value
          .ability === 'disabled'
            ? true: undefined
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
    tabindex: {
      get: () => (
        (elementOrListOrPlaneApi as ElementApi<SupportedElement, true, AbilityMeta>)
          .meta
          .value
          .ability === 'enabled'
            ? 0: -1
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
  } as AbilityBindValues<Api>
}
