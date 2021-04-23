import { schedule } from '../util/schedule.js'

export function bindStyle ({ target, property, value, watchSources }, options) {
  schedule(
    {
      target,
      effect: ({ target, value }) => {
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
