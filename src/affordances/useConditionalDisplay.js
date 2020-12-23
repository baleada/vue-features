import { useBinding } from '../util'

export default function useConditionalDisplay ({ target, condition, watchSources }, options) {
  const originalDisplays = new Map()

  useBinding(
    {
      target,
      bind: ({ el, value }) => {
        if (!originalDisplays.get(el)) {
          const originalDisplay = window.getComputedStyle(el).display
          originalDisplays.set(el, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.get(el)
        
        if (value) {
          if (el.style.display === originalDisplay) {
            return
          }

          el.style.display = originalDisplay
          return
        }

        if (el.style.display === 'none') {
          return
        }

        el.style.display = 'none'
      },
      value: condition,
      watchSources,
    },
    options
  )
}
