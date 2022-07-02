import type { Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions, TransitionJs, TransitionCss } from '../affordances'
import { createDefineTransition, ensureTransitions, toTransitionTypes } from '../affordances/show'

export function showAndFocusAfter (
  elementOrListOrPlane: Parameters<typeof show>[0],
  condition: Parameters<typeof show>[1],
  getAfterEnterFocusTarget: () => HTMLElement,
  getAfterLeaveFocusTarget: () => HTMLElement,
  options?: ShowOptions<Ref<HTMLElement>>
) {
  const transitionOption = options?.transition ?? {},
        defineTransition = createDefineTransition<Ref<HTMLElement>>(),
        ensuredTransitions = ensureTransitions(transitionOption, defineTransition),
        transitionTypes = toTransitionTypes(ensuredTransitions),
        enter = (() => {
          if (transitionTypes.enter === 'none') {
            return {
              after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
            }
          }

          if (transitionTypes.enter === 'js') {
            return {
              ...(ensuredTransitions.enter as TransitionJs<Ref<HTMLElement>>),
              after: () => {
                (ensuredTransitions.enter as TransitionJs<Ref<HTMLElement>>).after?.()
                requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
              }
            }
          }

          return {
            ...(ensuredTransitions.enter as TransitionCss),
            end: () => {
              (ensuredTransitions.enter as TransitionCss).end?.()
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
              ...(ensuredTransitions.leave as TransitionJs<Ref<HTMLElement>>),
              after: () => {
                (ensuredTransitions.leave as TransitionJs<Ref<HTMLElement>>).after?.()
                requestAnimationFrame(() => getAfterLeaveFocusTarget().focus())
              }
            }
          }

          return {
            ...(ensuredTransitions.leave as TransitionCss),
            end: () => {
              (ensuredTransitions.leave as TransitionCss).end?.()
              requestAnimationFrame(() => getAfterLeaveFocusTarget().focus())
            }
          }
        })(),
        appear = (() => {
          if (ensuredTransitions.appear === true) return enter

          if (transitionTypes.appear === 'none') {
            return {
              after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
            }
          }

          if (transitionTypes.appear === 'js') {
            return {
              ...(ensuredTransitions.appear as TransitionJs<Ref<HTMLElement>>),
              after: () => {
                (ensuredTransitions.appear as TransitionJs<Ref<HTMLElement>>).after?.()
                requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
              }
            }
          }

          return {
            ...(ensuredTransitions.appear as TransitionCss),
            end: () => {
              (ensuredTransitions.appear as TransitionCss).end?.()
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
