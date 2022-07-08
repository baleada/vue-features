import type { Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions, TransitionJs, TransitionCss } from '../affordances'
import { toTransitionTypes } from '../affordances/show'

export function showAndFocusAfter (
  elementOrListOrPlane: Parameters<typeof show>[0],
  condition: Parameters<typeof show>[1],
  getAfterEnterFocusTarget: () => HTMLElement,
  getAfterLeaveFocusTarget: () => HTMLElement,
  options?: ShowOptions<Ref<HTMLElement>>
) {
  const transitionOption = options?.transition ?? {},
        transitionTypes = toTransitionTypes(transitionOption),
        enter = (() => {
          if (transitionTypes.enter === 'none') {
            return {
              after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
            }
          }

          if (transitionTypes.enter === 'js') {
            return {
              ...(transitionOption.enter as TransitionJs<Ref<HTMLElement>>),
              after: () => {
                (transitionOption.enter as TransitionJs<Ref<HTMLElement>>).after?.()
                requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
              }
            }
          }

          return {
            ...(transitionOption.enter as TransitionCss),
            end: () => {
              (transitionOption.enter as TransitionCss).end?.()
              requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
            }
          }
        })(),
        leave = (() => {
          if (transitionTypes.leave === 'none') {
            return {
              after: () => requestAnimationFrame(() => getAfterLeaveFocusTarget()?.focus?.())
            }
          }

          if (transitionTypes.leave === 'js') {
            return {
              ...(transitionOption.leave as TransitionJs<Ref<HTMLElement>>),
              after: () => {
                (transitionOption.leave as TransitionJs<Ref<HTMLElement>>).after?.()
                requestAnimationFrame(() => getAfterLeaveFocusTarget().focus())
              }
            }
          }

          return {
            ...(transitionOption.leave as TransitionCss),
            end: () => {
              (transitionOption.leave as TransitionCss).end?.()
              requestAnimationFrame(() => getAfterLeaveFocusTarget().focus())
            }
          }
        })(),
        appear = (() => {
          if (transitionOption.appear === true) return enter

          if (transitionTypes.appear === 'none') {
            return {
              after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
            }
          }

          if (transitionTypes.appear === 'js') {
            return {
              ...(transitionOption.appear as TransitionJs<Ref<HTMLElement>>),
              after: () => {
                (transitionOption.appear as TransitionJs<Ref<HTMLElement>>).after?.()
                requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
              }
            }
          }

          return {
            ...(transitionOption.appear as TransitionCss),
            end: () => {
              (transitionOption.appear as TransitionCss).end?.()
              requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
            }
          }
        })()
  
  show(
    elementOrListOrPlane,
    condition,
    {
      transition: { appear, enter, leave },
    }
  )
}
