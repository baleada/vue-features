import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'

export type GetStatus<Status extends string, AffordanceElementType extends Ref<HTMLElement> | Ref<HTMLElement[]>> = 
  AffordanceElementType extends Ref<HTMLElement[]>
    ? (index: number) => Status
    : () => Status

export function ensureGetStatus<Status extends string, AffordanceElementType extends Ref<HTMLElement> | Ref<HTMLElement[]>> (
  { element, status }: {
    element: AffordanceElementType,
    status: BindValue<Status> | BindValueGetterWithWatchSources<Status>,
  }
): GetStatus<Status, AffordanceElementType> {
  if (Array.isArray(element.value)) {
    return (index => {
      if (typeof status === 'string') {
        return status
      }
  
      if (isRef(status)) {
        return status.value
      }
  
      if (typeof status === 'function') {
        return status({ element: (element.value as HTMLElement[])[index], index })
      }
  
      return status.get({ element: (element.value as HTMLElement[])[index], index })
    }) as GetStatus<Status, AffordanceElementType>
  }

  return () => {
    if (typeof status === 'string') {
      return status
    }

    if (isRef(status)) {
      return status.value
    }

    if (typeof status === 'function') {
      return status({ element: element.value as HTMLElement, index: 0 })
    }

    return status.get({ element: element.value as HTMLElement, index: 0 })
  }
}
