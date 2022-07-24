import type { Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions } from '../affordances'
import { showWithEffects } from './showWithEffects'

export function showAndFocusAfter (
  elementOrListOrPlane: Parameters<typeof show>[0],
  condition: Parameters<typeof show>[1],
  getAfterEnterFocusTarget: () => HTMLElement,
  getAfterLeaveFocusTarget: () => HTMLElement,
  options?: ShowOptions<Ref<HTMLElement>>
) {
  showWithEffects(
    elementOrListOrPlane,
    condition,
    {
      appear: {
        none: {
          after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus()),
        },
        js: {
          after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus()),
        },
        css: {
          end: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus()),
        }
      },
      enter: {
        none: {
          after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus()),
        },
        js: {
          after: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus()),
        },
        css: {
          end: () => requestAnimationFrame(() => getAfterEnterFocusTarget().focus()),
        },
      },
      leave: {
        none: {
          after: () => requestAnimationFrame(() => getAfterLeaveFocusTarget().focus()),
        },
        js: {
          after: () => requestAnimationFrame(() => getAfterLeaveFocusTarget().focus()),
        },
        css: {
          end: () => requestAnimationFrame(() => getAfterLeaveFocusTarget().focus()),
        },
      }
    },
    options
  )
}
