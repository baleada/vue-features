import useBinding from '../util/useBinding.js'

export default function useStyleBinding ({ target, property, value, watchSources }, options) {
  useBinding(
    {
      target,
      bind: ({ target, value }) => {
        if (target.style[property] === value) {
          return
        }
        
        target.style[property] = value
      },
      value,
      watchSources,
    },
    options
  )
}
