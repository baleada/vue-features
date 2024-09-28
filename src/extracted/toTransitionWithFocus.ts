import { nextTick } from 'vue'
import {
  type ShowOptions,
  type BindElement,
} from '../affordances'
import {
  toTransitionWithEffects,
  type TransitionEffects,
} from './toTransitionWithEffects'

export function toTransitionWithFocus<B extends BindElement> (
  { focusAfterEnter, focusAfterLeave }: {
    focusAfterEnter: () => void,
    focusAfterLeave: () => void,
  },
  options?: ShowOptions<B>
) {
  const appearAndEnterJsEffects = {
          after: () => nextTick(focusAfterEnter),
          cancel: () => nextTick(focusAfterLeave),
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          },
        } as TransitionEffects<B>['appear']['js'],
        appearAndEnterEffects = {
          none: appearAndEnterJsEffects,
          js: appearAndEnterJsEffects,
          css: {
            end: () => nextTick(focusAfterEnter),
            cancel: () => nextTick(focusAfterLeave),
          },
        } as TransitionEffects<B>['appear'],
        leaveJsEffects = {
          after: () => nextTick(focusAfterLeave),
          cancel: () => nextTick(focusAfterEnter),
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          },
        } as TransitionEffects<B>['leave']['js']

  return toTransitionWithEffects(
    {
      appear: appearAndEnterEffects,
      enter: appearAndEnterEffects,
      leave: {
        none: leaveJsEffects,
        js: leaveJsEffects,
        css: {
          end: () => nextTick(focusAfterLeave),
          cancel: () => nextTick(focusAfterEnter),
        },
      },
    },
    options
  )
}
