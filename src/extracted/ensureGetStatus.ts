import { isRef } from 'vue'
import type { Ref } from 'vue'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'

export type GetStatus<Status extends string, AffordanceElementType extends Ref<HTMLElement> | Ref<HTMLElement[]>> = 
  AffordanceElementType extends Ref<HTMLElement[]>
    ? (index: number) => Status
    : () => Status

export function ensureGetStatus<Status extends string, AffordanceElementType extends Ref<HTMLElement> | Ref<HTMLElement[]>> (
  { element, getStatus }: {
    element: AffordanceElementType,
    getStatus: BindValue<Status> | BindValueGetterWithWatchSources<Status>,
  }
): GetStatus<Status, AffordanceElementType> {
  if (Array.isArray(element.value)) {
    return (index => {
      if (typeof getStatus === 'string') {
        return getStatus
      }
  
      if (isRef(getStatus)) {
        return getStatus.value
      }
  
      if (typeof getStatus === 'function') {
        return getStatus({ element: (element.value as HTMLElement[])[index], index })
      }
  
      return getStatus.getValue({ element: (element.value as HTMLElement[])[index], index })
    }) as GetStatus<Status, AffordanceElementType>
  }

  return () => {
    if (typeof getStatus === 'string') {
      return getStatus
    }

    if (isRef(getStatus)) {
      return getStatus.value
    }

    if (typeof getStatus === 'function') {
      return getStatus({ element: element.value as HTMLElement, index: 0 })
    }

    return getStatus.getValue({ element: element.value as HTMLElement, index: 0 })
  }
}
