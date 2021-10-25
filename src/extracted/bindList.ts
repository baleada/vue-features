import type { WatchSource } from 'vue'
import { scheduleBind } from './scheduleBind'
import type { BindValue, BindElement } from './scheduleBind'

export function bindList (
  { element, list, value, watchSources }: {
    element: BindElement,
    list: 'class' | 'rel',
    value: BindValue<string>,
    watchSources: WatchSource | WatchSource[]
  }
) {
  const cache = new WeakMap<HTMLElement, string>()

  scheduleBind({
    element,
    value,
    assign: ({ element, value }) => {
      const domTokenList: HTMLElement['classList'] = element[`${list}List`]

      if (domTokenList.contains(value)) {
        return
      }
      
      const cached = cache.get(element) || ''

      domTokenList.remove(...toListStrings(cached))
      domTokenList.add(...toListStrings(value))
      
      cache.set(element, value)
    },
    remove: () => {},
    watchSources,
  })
}

function toListStrings (value: string): string[] {
  return value.split(' ').filter(string => string)
}
