import type { BindValueGetter } from './scheduleBind'
import { Plane } from './narrowReactivePlane'
import type {
  IdentifiedPlaneApi,
  IdentifiedListApi,
  IdentifiedElementApi,
} from './useElementApi'

export type LabelMeta = { label?: string, labelledby?: string }

type LabelBindValues<Labelable extends
  IdentifiedPlaneApi<HTMLElement, LabelMeta>
  | IdentifiedListApi<HTMLElement, LabelMeta>
  | IdentifiedElementApi<HTMLElement, LabelMeta>
> = Record<
  'ariaLabel' | 'ariaLabelledby',
  BindValueGetter<
    Labelable extends IdentifiedPlaneApi<HTMLElement, LabelMeta> ? Plane<HTMLElement> :
    Labelable extends IdentifiedListApi<HTMLElement, LabelMeta> ? HTMLElement[] :
    HTMLElement,
    string
  >
>

export function toLabelBindValues<
  Labelable extends
    IdentifiedPlaneApi<HTMLElement, LabelMeta>
    | IdentifiedListApi<HTMLElement, LabelMeta>
    | IdentifiedElementApi<HTMLElement, LabelMeta>
> (elementOrListOrPlaneApi: Labelable): LabelBindValues<Labelable> {
  if (elementOrListOrPlaneApi.meta.value instanceof Plane) {
    return {
      ariaLabel: (row, column) => (elementOrListOrPlaneApi as IdentifiedPlaneApi<HTMLElement, LabelMeta>)
        .meta
        .value
        ?.[row]
        ?.[column]
        ?.label
        || undefined,
      ariaLabelledby: (row, column) => (elementOrListOrPlaneApi as IdentifiedPlaneApi<HTMLElement, LabelMeta>)
        .meta
        .value
        ?.[row]
        ?.[column]
        ?.labelledby
        || undefined,
    } as LabelBindValues<Labelable>
  }

  if (Array.isArray(elementOrListOrPlaneApi.meta.value)) {
    return {
      ariaLabel: index => (elementOrListOrPlaneApi as IdentifiedListApi<HTMLElement, LabelMeta>)
        .meta
        .value
        ?.[index]
        ?.label
        || undefined,
      ariaLabelledby: index => (elementOrListOrPlaneApi as IdentifiedListApi<HTMLElement, LabelMeta>)
        .meta
        .value
        ?.[index]
        ?.labelledby
        || undefined,
    } as LabelBindValues<Labelable>
  }

  return {
    ariaLabel: () => (elementOrListOrPlaneApi as IdentifiedElementApi<HTMLElement, LabelMeta>).
      meta
      .value
      .label
      || undefined,
    ariaLabelledby: () => (elementOrListOrPlaneApi as IdentifiedElementApi<HTMLElement, LabelMeta>).
      meta
      .value
      .labelledby
      || undefined,
  } as unknown as LabelBindValues<Labelable>
}
