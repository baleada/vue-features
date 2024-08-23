import { createList } from '@baleada/logic'
import type { BindReactiveValueGetter } from '../affordances'
import { Plane } from './plane'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import type { PlaneApi } from './usePlaneApi'

export type LabelMeta = {
  label?: string,
  labelledBy?: string | string[],
  description?: string,
  describedBy?: string | string[],
  errorMessage?: string,
  details?: string,
}

export const defaultLabelMeta: LabelMeta = {
  label: undefined,
  labelledBy: undefined,
  description: undefined,
  describedBy: undefined,
  errorMessage: undefined,
  details: undefined,
}

type LabelBindValues<
  Api extends (
    | PlaneApi<HTMLElement, any, LabelMeta>
    | ListApi<HTMLElement, any, LabelMeta>
    | ElementApi<HTMLElement, any, LabelMeta>
  )
> = Record<
  (
    | 'ariaLabel'
    | 'ariaLabelledby'
    | 'ariaDescription'
    | 'ariaDescribedby'
    | 'ariaDetails'
  ),
  BindReactiveValueGetter<
    Api extends PlaneApi<HTMLElement, any, LabelMeta> ? PlaneApi<HTMLElement, any, LabelMeta>['plane'] :
    Api extends ListApi<HTMLElement, any, LabelMeta> ? ListApi<HTMLElement, any, LabelMeta>['list'] :
    ElementApi<HTMLElement, any, LabelMeta>['element'],
    string
  >
>

export function toLabelBindValues<
  Api extends (
    | PlaneApi<HTMLElement, any, LabelMeta>
    | ListApi<HTMLElement, any, LabelMeta>
    | ElementApi<HTMLElement, any, LabelMeta>
  )
> (elementOrListOrPlaneApi: Api): LabelBindValues<Api> {
  if (elementOrListOrPlaneApi.meta.value instanceof Plane) {
    return {
      ariaLabel: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.label
            || undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaLabelledby: {
        get: ({ row, column }) => toListValue(
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.labelledBy
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDescription: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.description
            || undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDescribedby: {
        get: ({ row, column }) => toListValue(
          [
            toListValue(
              (elementOrListOrPlaneApi as PlaneApi<HTMLElement, any, LabelMeta>)
                .meta
                .value
                ?.get({ row, column })
                ?.describedBy,
            ),
            toListValue(
              (elementOrListOrPlaneApi as PlaneApi<HTMLElement, any, LabelMeta>)
                .meta
                .value
                ?.get({ row, column })
                ?.errorMessage,
            ),
          ]
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDetails: {
        get: ({ row, column }) => toListValue(
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.details
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
    } as LabelBindValues<Api>
  }

  if (Array.isArray(elementOrListOrPlaneApi.meta.value)) {
    return {
      ariaLabel: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.[index]
            ?.label
            || undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaLabelledby: {
        get: index => toListValue(
          (elementOrListOrPlaneApi as ListApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.[index]
            ?.labelledBy
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDescription: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.[index]
            ?.description
            || undefined
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDescribedby: {
        get: index => toListValue(
          [
            toListValue(
              (elementOrListOrPlaneApi as ListApi<HTMLElement, any, LabelMeta>)
                .meta
                .value
                ?.[index]
                ?.describedBy,
            ),
            toListValue(
              (elementOrListOrPlaneApi as ListApi<HTMLElement, any, LabelMeta>)
                .meta
                .value
                ?.[index]
                ?.errorMessage,
            ),
          ]
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDetails: {
        get: index => toListValue(
          (elementOrListOrPlaneApi as ListApi<HTMLElement, any, LabelMeta>)
            .meta
            .value
            ?.[index]
            ?.details
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
    } as LabelBindValues<Api>
  }

  return {
    ariaLabel: {
      get: () => (
        (elementOrListOrPlaneApi as ElementApi<HTMLElement, any, LabelMeta>)
          .meta
          .value
          .label
          || undefined
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
    ariaLabelledby: {
      get: () => toListValue(
        (elementOrListOrPlaneApi as ElementApi<HTMLElement, any, LabelMeta>)
          .meta
          .value
          .labelledBy
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
    ariaDescription: {
      get: () => (
        (elementOrListOrPlaneApi as ElementApi<HTMLElement, any, LabelMeta>)
          .meta
          .value
          .description
          || undefined
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
    ariaDescribedby: {
      get: () => toListValue(
        [
          toListValue(
            (elementOrListOrPlaneApi as ElementApi<HTMLElement, any, LabelMeta>)
              .meta
              .value
              .describedBy,
          ),
          toListValue(
            (elementOrListOrPlaneApi as ElementApi<HTMLElement, any, LabelMeta>)
              .meta
              .value
              .errorMessage,
          ),
        ]
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
    ariaDetails: {
      get: () => toListValue(
        (elementOrListOrPlaneApi as ElementApi<HTMLElement, any, LabelMeta>)
          .meta
          .value
          .details
      ),
      watchSource: elementOrListOrPlaneApi.meta,
    },
  } as LabelBindValues<Api>
}

function toListValue(idOrList: string | string[] | undefined): string | undefined {
  return Array.isArray(idOrList)
    ? toList(...idOrList) || undefined
    : idOrList
}

const toList = createList()
