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

export function useWithListFocus (list: Ref<HTMLElement[]>): WithListFocus {
  const statuses = ref<('focused' | 'blurred')[]>([])

  onListRendered(
    list,
    { listEffect: () => statuses.value = toBlurred(list.value) }
  )

  // TODO: Use focusin on root element
  on(
    list,
    {
      focus: {
        createEffect: index => () => {
          statuses.value = createReplace<'focused' | 'blurred'>(
            index,
            'focused'
          )(toBlurred(list.value))
        },
      },
      blur: {
        createEffect: () => () => {
          statuses.value = toBlurred(list.value)
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
