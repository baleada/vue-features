import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { ComputedRef } from 'vue'
import { createReplace } from '@baleada/logic'
import { on } from '../affordances'

export type ListFocusTrackings = {
  statuses: ComputedRef<('focused' | 'blurred')[]>
  is: {
    focused: (index: number) => boolean,
    blurred: (index: number) => boolean,
  }
}

export function useListFocusTrackings (elements: Ref<HTMLElement[]>): ListFocusTrackings {
  const statuses = ref<('focused' | 'blurred')[]>([])
  onMounted(() => {
    statuses.value = new Array(elements.value.length).fill('blurred')
  })

  // TODO: Use focusin on root element
  on(
    elements,
    {
      focus: {
        createEffect: index => () => {
          statuses.value = createReplace<'focused' | 'blurred'>(index, 'focused')(
            new Array(elements.value.length).fill('blurred')
          )
        },
      },
      blur: {
        createEffect: index => () => {
          statuses.value = new Array(elements.value.length).fill('blurred')
        },
      }
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
