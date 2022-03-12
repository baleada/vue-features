import type { Ref } from 'vue'
import { Plane, toAffordanceElementKind } from '.'
import type { BindReactiveValueGetter } from '../affordances'
import type { BindValueGetter } from './scheduleBind'

export type StatusOption<B extends Ref<HTMLElement> | Ref<HTMLElement[]> | Ref<Plane<HTMLElement>>, Status extends string> = BindValueGetter<B, Status> | BindReactiveValueGetter<B, Status>

export type GetStatus<
  B extends Ref<HTMLElement> | Ref<HTMLElement[]> | Ref<Plane<HTMLElement>>,
  Status extends string
> = 
  B extends Ref<Plane<HTMLElement>>
    ? (row: number, column: number) => Status
    : B extends Ref<HTMLElement[]>
      ? (index: number) => Status
      : () => Status

export function ensureGetStatus<B extends Ref<HTMLElement> | Ref<HTMLElement[]> | Ref<Plane<HTMLElement>>, Status extends string> (
  elementOrListOrPlane: B,
  status: StatusOption<B, Status>,
): GetStatus<B, Status> {
  const affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane)

  if (affordanceElementKind === 'plane') {
    return ((row, column) => {
      if (typeof status === 'function') {
        return status(row, column)
      }
  
      return status.get(row, column)
    }) as GetStatus<B, Status>
  }

  if (affordanceElementKind === 'list') {
    return (index => {
      if (typeof status === 'function') {
        return (status as BindValueGetter<Ref<HTMLElement[]>, Status>)(index)
      }
  
      return (status as BindReactiveValueGetter<Ref<HTMLElement[]>, Status>).get(index)
    }) as GetStatus<B, Status>
  }

  return (() => {
    if (typeof status === 'function') {
      return (status as BindValueGetter<Ref<HTMLElement>, Status>)(0)
    }

    return (status as BindReactiveValueGetter<Ref<HTMLElement>, Status>).get(0)
  }) as GetStatus<B, Status>
}
