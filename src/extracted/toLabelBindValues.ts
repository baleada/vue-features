import { createList } from '@baleada/logic'
import type { BindValueGetter } from './onRenderedBind'
import { Plane } from './plane'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import type { PlaneApi } from './usePlaneApi'

export type LabelMeta = {
  label?: string,
  labelledby?: string | string[],
  description?: string,
  describedBy?: string | string[],
  errorMessage?: string,
  details?: string,
}

export const defaultLabelMeta: LabelMeta = {
  label: undefined,
  labelledby: undefined,
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
  'ariaLabel' | 'ariaLabelledby' | 'ariaDescription' | 'ariaDescribedby' | 'ariaDetails',
  BindValueGetter<
    Labelable extends PlaneApi<HTMLElement, true, LabelMeta> ? Plane<HTMLElement> :
    Labelable extends ListApi<HTMLElement, true, LabelMeta> ? HTMLElement[] :
    HTMLElement,
    string
  >
>

export function toLabelBindValues<
  Labelable extends
    PlaneApi<HTMLElement, true, LabelMeta>
    | ListApi<HTMLElement, true, LabelMeta>
    | ElementApi<HTMLElement, true, LabelMeta>
> (elementOrListOrPlaneApi: Labelable): LabelBindValues<Labelable> {
  if (elementOrListOrPlaneApi.meta.value instanceof Plane) {
    return {
      ariaLabel: (row, column) => (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        ?.[row]
        ?.[column]
        ?.label
        || undefined,
      ariaLabelledby: (row, column) => toListValue(
        (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
          .meta
          .value
          ?.[row]
          ?.[column]
          ?.labelledby
      ),
      ariaDescription: (row, column) => (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        ?.[row]
        ?.[column]
        ?.description
        || undefined,
      ariaDescribedby: (row, column) => toListValue(
        [
          toListValue(
            (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
              .meta
              .value
              ?.[row]
              ?.[column]
              ?.describedBy,
          ),
          toListValue(
            (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
              .meta
              .value
              ?.[row]
              ?.[column]
              ?.errorMessage,
          ),
        ]
      ),
      ariaDetails: (row, column) => toListValue(
        (elementOrListOrPlaneApi as PlaneApi<HTMLElement, true, LabelMeta>)
          .meta
          .value
          ?.[row]
          ?.[column]
          ?.details
      ),
    } as LabelBindValues<Labelable>
  }

  if (Array.isArray(elementOrListOrPlaneApi.meta.value)) {
    return {
      ariaLabel: index => (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        ?.[index]
        ?.label
        || undefined,
      ariaLabelledby: index => toListValue(
        (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
          .meta
          .value
          ?.[index]
          ?.labelledby
      ),
      ariaDescription: index => (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        ?.[index]
        ?.description
        || undefined,
      ariaDescribedby: index => toListValue(
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
      ariaDetails: index => toListValue(
        (elementOrListOrPlaneApi as ListApi<HTMLElement, true, LabelMeta>)
          .meta
          .value
          ?.[index]
          ?.details
      ),
    } as LabelBindValues<Labelable>
  }

  return {
    ariaLabel: () => (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>).
      meta
      .value
      .label
      || undefined,
    ariaLabelledby: () => toListValue(
      (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        .labelledby
    ),
    ariaDescription: () => (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
      .meta
      .value
      .description
      || undefined,
    ariaDescribedby: () => toListValue(
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
    ),
    ariaDetails: () => toListValue(
      (elementOrListOrPlaneApi as ElementApi<HTMLElement, true, LabelMeta>)
        .meta
        .value
        .details
    ),
  } as unknown as LabelBindValues<Labelable>
}

function toListValue(idOrList: string | string[] | undefined): string | undefined {
  return Array.isArray(idOrList)
    ? toList(...idOrList) || undefined
    : idOrList
}

const toList = createList()
