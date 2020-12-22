import { useBinding } from '../util'

export default function useListBinding ({ target, list, value }, options) {
  const cache = new Map()

  useBinding({
    target,
    value,
    bind: ({ el, value }) => {
      const cached = cache.get(el) || ''

      console.log(toListStrings(value))
      console.log(toListStrings(cached))

      el[`${list}List`].remove(...toListStrings(cached))
      el[`${list}List`].add(...toListStrings(value))
      
      cache.set(el, value)
    }
  }, options)
}

function toListStrings (value) {
  return value.split(' ').filter(string => string)
}
