import { useBinding } from '../util'

export default function useConditionalDisplay ({ target, condition, watchSources }, options) {
  const originalDisplays = new Map()

  useBinding(
    {
      target,
      bind: ({ target, value }) => {
        if (!originalDisplays.get(target)) {
          const originalDisplay = window.getComputedStyle(target).display
          originalDisplays.set(target, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.get(target)
        
        if (value) {
          if (target.style.display === originalDisplay) {
            return
          }

          target.style.display = originalDisplay
          return
        }

        if (target.style.display === 'none') {
          return
        }

        target.style.display = 'none'
      },
      value: condition,
      watchSources,
    },
    options
  )
}
