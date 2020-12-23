import { useBinding } from '../util'

export default function useStyleBinding ({ target, property, value }, options) {
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
    },
    options
  )
}
