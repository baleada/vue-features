import type { WatchSource } from 'vue'
import { scheduleBindEffect } from '../util'
import type { Target, BindValue } from '../util'

export function bindList (
  { target, list, value, watchSources }: {
    target: Target,
    list: 'class' | 'rel',
    value: BindValue<string>,
    watchSources: WatchSource | WatchSource[]
  }
) {
  const cache = new WeakMap<Element, string>()

  scheduleBindEffect({
    target,
    value,
    effect: ({ target, value }) => {
      const domTokenList = target[`${list}List`] as Element['classList']

      if (domTokenList.contains(value)) {
        return
      }
      
      const cached = cache.get(target) || ''

      domTokenList.remove(...toListStrings(cached))
      domTokenList.add(...toListStrings(value))
      
      cache.set(target, value)
    },
    watchSources,
  })
}

function toListStrings (value: string): string[] {
  return value.split(' ').filter(string => string)
}
