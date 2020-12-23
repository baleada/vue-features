import { useBinding } from '../util'

export default function useStyleBinding ({ target, property, value }, options) {
  useBinding(
    {
      target,
      bind: ({ el, value }) => {
        if (el.style[property] === value) {
          return
        }
        
        el.style[property] = value
      },
      value,
    },
    options
  )
}
