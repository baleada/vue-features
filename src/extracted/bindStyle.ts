import type { WatchSource } from 'vue'
import { scheduleBind } from './scheduleBind'
import type { BindValue, BindElement } from './scheduleBind'

export function bindStyle<B extends BindElement> (
  elementOrListOrPlane: B,
  property: string,
  value: BindValue<B, string>,
  watchSources: WatchSource | WatchSource[]
) {
  scheduleBind<B, string>(
    elementOrListOrPlane,
    (element, value) => {
      if (element.style[property] === value) {
        return
      }
      
      element.style[property] = value
    },
    element => {
      element.style[property] = ''
    },
    value,
    watchSources,
  )
}
