import { useBinding } from '../util'

export default function useListBinding ({ target, list, value }, options) {
  const cache = new Map()

  useBinding({
    target,
    value,
    bind: ({ target, value }) => {
      if (target[`${list}List`].contains(value)) {
        return
      }
      
      const cached = cache.get(target) || ''

      target[`${list}List`].remove(...toListStrings(cached))
      target[`${list}List`].add(...toListStrings(value))
      
      cache.set(target, value)
    }
  }, options)
}

function toListStrings (value) {
  return value.split(' ').filter(string => string)
}
