import type { Ref } from 'vue'
import type { BindReactiveValueGetter } from '../affordances'
import type { BindValueGetter } from './scheduleBind'

export type StatusOption<Status extends string> = BindValueGetter<Status> | BindReactiveValueGetter<Status>

export type GetStatus<Status extends string, AffordanceElementType extends Ref<HTMLElement> | Ref<HTMLElement[]>> = 
  AffordanceElementType extends Ref<HTMLElement[]>
    ? (index: number) => Status
    : () => Status

export function ensureGetStatus<Status extends string, AffordanceElementType extends Ref<HTMLElement> | Ref<HTMLElement[]>> (
  { element, status }: {
    element: AffordanceElementType,
    status: StatusOption<Status>,
  }
): GetStatus<Status, AffordanceElementType> {
  if (Array.isArray(element.value)) {
    return (index => {
      if (typeof status === 'function') {
        return status({ index })
      }
  
      return status.get({ index })
    }) as GetStatus<Status, AffordanceElementType>
  }

  return () => {
    if (typeof status === 'function') {
      return status({ index: 0 })
    }

    return status.get({ index: 0 })
  }
}
