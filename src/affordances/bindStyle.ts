import type { WatchSource } from 'vue'
import { schedule } from '../util'
import type { Target, BindValue } from '../util'

export function bindStyle ({ target, property, value, watchSources }: {
  target: Target,
  property: string,
  value: BindValue<string>,
  watchSources?: WatchSource | WatchSource[]
}) {
  schedule<string>(
    {
      target,
      effect: ({ target, value }) => {
        if ((target as HTMLElement).style[property] === value) {
          return
        }
        
        (target as HTMLElement).style[property] = value
      },
      value,
      watchSources,
    }
  )
}


SVGElement
