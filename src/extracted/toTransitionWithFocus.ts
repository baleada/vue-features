import { nextTick } from 'vue'
import type { ShowOptions, BindElement } from '../affordances'
import { toTransitionWithEffects } from './toTransitionWithEffects'
import type { TransitionEffects } from './toTransitionWithEffects'

export function toTransitionWithFocus<B extends BindElement> (
  elementOrListOrPlane: B,
  getPostEnterFocusTarget: () => HTMLElement | undefined,
  getPostLeaveFocusTarget: () => HTMLElement | undefined,
  options?: ShowOptions<B>
) {
  const appearAndEnterJsEffects = {
          after: () => nextTick(() => getPostEnterFocusTarget()?.focus?.()),
          cancel: () => nextTick(() => getPostLeaveFocusTarget()?.focus?.()),
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          }
        } as TransitionEffects<B>['appear']['js'],
        appearAndEnterEffects = {
          none: appearAndEnterJsEffects,
          js: appearAndEnterJsEffects,
          css: {
            end: () => nextTick(() => getPostEnterFocusTarget()?.focus?.()),
            cancel: () => nextTick(() => getPostLeaveFocusTarget()?.focus?.()),
          }
        } as TransitionEffects<B>['appear'],
        leaveJsEffects = {
          after: () => nextTick(() => getPostLeaveFocusTarget()?.focus?.()),
          cancel: () => nextTick(() => getPostEnterFocusTarget()?.focus?.()),
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          }
        } as TransitionEffects<B>['leave']['js']

  return toTransitionWithEffects<typeof elementOrListOrPlane>(
    elementOrListOrPlane,
    {
      appear: appearAndEnterEffects,
      enter: appearAndEnterEffects,
      leave: {
        none: leaveJsEffects,
        js: leaveJsEffects,
        css: {
          end: () => nextTick(() => getPostLeaveFocusTarget()?.focus?.()),
          cancel: () => nextTick(() => getPostEnterFocusTarget()?.focus?.()),
        },
      }
    },
    options
  )
}
