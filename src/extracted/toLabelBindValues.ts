import { createList } from '@baleada/logic'
import { computed } from 'vue'
import type { BindReactiveValueGetter } from '../affordances'
import type { BindValue } from './onRenderedBind'
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

type LabelBindValues<Labelable extends
  PlaneApi<HTMLElement, true, LabelMeta>
  | ListApi<HTMLElement, true, LabelMeta>
  | ElementApi<HTMLElement, true, LabelMeta>
> = Record<
  (
    | 'ariaLabel'
    | 'ariaLabelledby'
    | 'ariaDescription'
    | 'ariaDescribedby'
    | 'ariaDetails'
  ),
  (
   | BindValue<
      Labelable extends PlaneApi<HTMLElement, true, LabelMeta> ? Plane<HTMLElement> :
      Labelable extends ListApi<HTMLElement, true, LabelMeta> ? HTMLElement[] :
      HTMLElement,
      string
    >
   | BindReactiveValueGetter<
      Labelable extends PlaneApi<HTMLElement, true, LabelMeta> ? Plane<HTMLElement> :
      Labelable extends ListApi<HTMLElement, true, LabelMeta> ? HTMLElement[] :
      HTMLElement,
      string
    >
  )
>

export function toLabelBindValues<
  Labelable extends
    PlaneApi<HTMLElement, true, LabelMeta>
    | ListApi<HTMLElement, true, LabelMeta>
    | ElementApi<HTMLElement, true, LabelMeta>
> (elementOrListOrPlaneApi: Labelable): LabelBindValues<Labelable> {
  if (elementOrListOrPlaneApi.meta.value instanceof Plane) {
    return {
      ariaLabel: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
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
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.labelledBy
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDescription: {
        get: ({ row, column }) => (
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
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
              (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
                .meta
                .value
                ?.get({ row, column })
                ?.describedBy,
            ),
            toListValue(
              (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
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
          (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
            .meta
            .value
            ?.get({ row, column })
            ?.details
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
    } as LabelBindValues<Labelable>
  }

  if (Array.isArray(elementOrListOrPlaneApi.meta.value)) {
    return {
      ariaLabel: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
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
          (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
            .meta
            .value
            ?.[index]
            ?.labelledBy
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
      ariaDescription: {
        get: index => (
          (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
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
              (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
                .meta
                .value
                ?.[index]
                ?.describedBy,
            ),
            toListValue(
              (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
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
          (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
            .meta
            .value
            ?.[index]
            ?.details
        ),
        watchSource: elementOrListOrPlaneApi.meta,
      },
    } as LabelBindValues<Labelable>
  }

  return {
    ariaLabel: computed(() => (
      (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        .label
        || undefined
    )),
    ariaLabelledby: computed(() => toListValue(
      (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        .labelledBy
    )),
    ariaDescription: computed(() => (
      (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        .description
        || undefined
    )),
    ariaDescribedby: computed(() => toListValue(
      [
        toListValue(
          (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
            .meta
            .value
            .describedBy,
        ),
        toListValue(
          (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
            .meta
            .value
            .errorMessage,
        ),
      ]
    )),
    ariaDetails: computed(() => toListValue(
      (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        .details
    )),
  } as unknown as LabelBindValues<Labelable>
}

function toListValue(idOrList: string | string[] | undefined): string | undefined {
  return Array.isArray(idOrList)
    ? toList(...idOrList) || undefined
    : idOrList
}

const toList = createList()
