import { ref, computed, type ComputedRef } from 'vue'
import { on } from '../affordances'
import {
  narrowElement,
  type ExtendableElement,
} from '../extracted'

export type Focus = {
  status: ComputedRef<FocusStatus>,
  target: ComputedRef<FocusTarget>,
  visibility: ComputedRef<FocusVisibility>,
  is: {
    focused: () => boolean,
    blurred: () => boolean,
    element: () => boolean,
    descendant: () => boolean,
    visible: () => boolean,
    invisible: () => boolean,
  },
}

export type FocusStatus = 'focused' | 'blurred'
export type FocusVisibility = 'visible' | 'invisible' | 'n/a'
export type FocusTarget = 'element' | 'descendant' | 'n/a'

export function useFocus (extendable: ExtendableElement): Focus {
  const element = narrowElement(extendable),
        status = ref<FocusStatus>('blurred'),
        visibility = ref<FocusVisibility>('n/a'),
        target = ref<FocusTarget>('n/a'),
        sync = () => {
          status.value = element.value.matches(':focus')
            ? 'focused'
            : 'blurred'

          target.value = status.value === 'focused'
            ? 'element'
            : element.value.matches(':focus-within')
              ? 'descendant'
              : 'n/a'

          visibility.value = target.value === 'n/a'
            ? 'n/a'
            : document.activeElement.matches(':focus-visible')
              ? 'visible'
              : 'invisible'
        }

  on(
    element,
    { focusin: sync, focusout: sync }
  )

  return {
    status: computed(() => status.value),
    target: computed(() => target.value),
    visibility: computed(() => visibility.value),
    is: {
      focused: () => status.value === 'focused',
      blurred: () => status.value === 'blurred',
      element: () => target.value === 'element',
      descendant: () => target.value === 'descendant',
      visible: () => visibility.value === 'visible',
      invisible: () => visibility.value === 'invisible',
    },
  }
}
