import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { ComputedRef } from 'vue'
import { createMap, createReplace } from '@baleada/logic'
import { on } from '../affordances'
import { onListRendered } from '../extracted'

export type WithListFocus = {
  statuses: ComputedRef<('focused' | 'blurred')[]>
  is: {
    focused: (index: number) => boolean,
    blurred: (index: number) => boolean,
  }
}

export function useWithListFocus (elements: Ref<HTMLElement[]>): WithListFocus {
  const statuses = ref<('focused' | 'blurred')[]>([])

  onListRendered(
    elements,
    { listEffect: () => statuses.value = toBlurred(elements.value) }
  )

  // TODO: Use focusin on root element
  on(
    elements,
    {
      focus: {
        createEffect: index => () => {
          statuses.value = createReplace<'focused' | 'blurred'>(
            index,
            'focused'
          )(toBlurred(elements.value))
        },
      },
      blur: {
        createEffect: () => () => {
          statuses.value = toBlurred(elements.value)
        },
      },
    }
  )

  return {
    statuses: computed(() => statuses.value),
    is: {
      focused: index => statuses.value[index] === 'focused',
      blurred: index => statuses.value[index] === 'blurred',
    },
  }
}

const toBlurred = createMap<HTMLElement, 'blurred'>(() => 'blurred')
