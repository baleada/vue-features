// TODO: When you bind a static class string to an element that has reactive
// class bindings from the Vue template, Vue erases, the static class string
// the first time reactive bindings update.
import type { WatchSource } from 'vue'
import { onRenderedBind } from './onRenderedBind'
import type { BindValue, BindElement } from './onRenderedBind'

export function bindList<B extends BindElement> (
  elementOrListOrPlane: B,
  list: 'class' | 'rel' | 'ariaDescribedbys' | 'ariaLabelledbys' | 'aria-describedbys' | 'aria-labelledbys',
  value: BindValue<B, string>,
  watchSources: WatchSource | WatchSource[]
) {
  const cache = new WeakMap<HTMLElement, string>()

  onRenderedBind(
    elementOrListOrPlane,
    (element, value) => {
      if (list === 'class' || list === 'rel') {
        const domTokenList: HTMLElement['classList'] = element[`${list}List`]

        if (domTokenList.contains(value)) return

        const cached = cache.get(element) || ''

        domTokenList.remove(...toListStrings(cached))
        domTokenList.add(...toListStrings(value))

        cache.set(element, value)

        return
      }

      const attribute = toAttribute(list),
            ids = (element.getAttribute(attribute) || '').split(' ')

      if (ids.includes(value)) return

      element.setAttribute(attribute, [...ids, value].join(' '))
    },
    () => {},
    value,
    watchSources,
  )
}

function toListStrings (value: string): string[] {
  // Empty string resolution allows returning `undefined` to unset.
  return (value || '').split(' ').filter(string => string)
}

const re = /aria-?(\w+)s$/
function toAttribute (list: 'ariaDescribedbys' | 'ariaLabelledbys' | 'aria-describedbys' | 'aria-labelledbys') {
  return `aria-${list.match(re)[1]}`.toLowerCase()
}
