import { show } from '../affordances'

export function showAndFocusAfter (
  elementOrElements: Parameters<typeof show>[0],
  condition: Parameters<typeof show>[1],
  getAfterEnterFocusTarget: () => HTMLElement,
  getAfterLeaveFocusTarget: () => HTMLElement,
  options?: Parameters<typeof show>[2]
) {
  const transition = options?.transition ?? {}
  
  show(
    elementOrElements,
    condition,
    {
      transition: {
        ...transition,
        appear: (() => {
          const appear = transition.appear

          if (typeof appear === 'object') {
            return {
              ...appear,
              after: (...params) => {
                // @ts-ignore
                appear.after?.(...params)
                requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
              }
            }
          }

          return true
        })(),
        enter: {
          ...(transition.enter ?? {}),
          after: (...params) => {
            // @ts-ignore
            transition.enter?.after?.(...params)
            requestAnimationFrame(() => getAfterEnterFocusTarget().focus())
          }
        },
        leave: {
          ...(transition.leave ?? {}),
          after: (...params) => {
            // @ts-ignore
            transition.leave?.after?.(...params)
            requestAnimationFrame(() => getAfterLeaveFocusTarget().focus())
          }
        }
      }
    }
  )
}
