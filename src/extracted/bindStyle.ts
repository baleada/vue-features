import type { WatchSource } from 'vue'
import { scheduleBind } from './scheduleBind'
import type { BindValue, BindElement } from './scheduleBind'

export function bindStyle ({ elementOrElements, property, value, watchSources }: {
  elementOrElements: BindElement,
  property: string,
  value: BindValue<string>,
  watchSources: WatchSource | WatchSource[]
}) {
  scheduleBind<string>(
    {
      elementOrElements,
      assign: ({ element, value }) => {
        if ((element as HTMLElement).style[property] === value) {
          return
        }
        
        (element as HTMLElement).style[property] = value
      },
      remove: ({ element }) => {
        (element as HTMLElement).style[property] = ''
      },
      value,
      watchSources,
    }
  )
}
