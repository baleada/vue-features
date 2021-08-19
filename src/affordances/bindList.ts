import type { WatchSource } from 'vue'
import { scheduleBind } from '../util'
import type { BindTarget, BindValue } from '../util'

export function bindList (
  { element, list, value, watchSources }: {
    element: BindTarget,
    list: 'class' | 'rel',
    value: BindValue<string>,
    watchSources: WatchSource | WatchSource[]
  }
) {
  const cache = new WeakMap<Element, string>()

  scheduleBind({
    element,
    value,
    effect: ({ element, value }) => {
      const domTokenList: Element['classList'] = element[`${list}List`]

      if (domTokenList.contains(value)) {
        return
      }
      
      const cached = cache.get(element) || ''

      domTokenList.remove(...toListStrings(cached))
      domTokenList.add(...toListStrings(value))
      
      cache.set(element, value)
    },
    watchSources,
  })
}

function toListStrings (value: string): string[] {
  return value.split(' ').filter(string => string)
}
