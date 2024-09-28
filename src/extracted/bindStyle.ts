import { type WatchSource } from 'vue'
import {
  onRenderedBind,
  type BindValue,
  type BindElement,
} from './onRenderedBind'

export function bindStyle<B extends BindElement> (
  elementOrListOrPlane: B,
  property: string,
  value: BindValue<B, string>,
  watchSources: WatchSource | WatchSource[]
) {
  return onRenderedBind<B, string>(
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
