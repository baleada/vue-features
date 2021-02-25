import schedule from '../util/schedule.js'

export default function bindList ({ target, list, value, watchSources }, options) {
  const cache = new Map()

  schedule({
    target,
    value,
    effect: ({ target, value }) => {
      if (target[`${list}List`].contains(value)) {
        return
      }
      
      const cached = cache.get(target) || ''

      target[`${list}List`].remove(...toListStrings(cached))
      target[`${list}List`].add(...toListStrings(value))
      
      cache.set(target, value)
    },
    watchSources,
  }, options)
}

function toListStrings (value) {
  return value.split(' ').filter(string => string)
}
