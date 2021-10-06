// TODO: optional aria-owns
import { ref, shallowRef, computed, onMounted, watchEffect, watchPostEffect, watch } from 'vue'
import type { Ref } from 'vue'
import type { Navigateable } from '@baleada/logic'
import { useNavigateable } from '@baleada/vue-composition'
import { bind, on } from '../affordances'
import {
  useHistory,
  useSingleElement,
  useMultipleElements,
} from '../extracted'
import type {
  SingleElement,
  MultipleElements,
  History,
  UseHistoryOptions,
} from '../extracted'

export type Listbox<Multiselectable extends boolean> = Multiselectable extends true
  ? ListboxBase & {
    active: Ref<number[]>,
    activate: (indexOrIndices: number | number[]) => void,
    deactivate: (indexOrIndices?: number | number[]) => void,
    selected: Ref<number[]>,
    select: (indexOrIndices: number | number[]) => void,
    deselect: (indexOrIndices?: number | number[]) => void,
  }
  : ListboxBase & {
    active: Ref<number>,
    activate: (index: number) => void,
    deactivate: (index: number) => void,
    selected: Ref<number>,
    select: (index: number) => void,
    deselect: (index: number) => void,
  }

type ListboxBase = {
  root: SingleElement<HTMLElement>,
  options: MultipleElements<HTMLElement>,
  navigateable: Ref<Navigateable<HTMLElement>>,
  history: History<{ active: number[], selected: number[] }>,
  is: {
    active: (index: number) => boolean,
    selected: (index: number) => boolean,
  }
}

export type UseListboxOptions<Multiselectable extends boolean> = Multiselectable extends true
  ? UseListboxOptionsBase<Multiselectable> & {
    initialSelected?: number | number[],
    initialActive?: number | number[],
  }
  : UseListboxOptionsBase<Multiselectable> & {
    initialSelected?: number,
    initialActive?: number,
  }

type UseListboxOptionsBase<Multiselectable extends boolean> = {
  multiselectable?: Multiselectable,
  history?: UseHistoryOptions,
}

const defaultOptions: UseListboxOptions<false> = {
  multiselectable: false,
  initialSelected: 0,
  initialActive: 0,
}

export function useListbox<Multiselectable extends boolean> (options: UseListboxOptions<Multiselectable> = {}): Listbox<Multiselectable> {
  const {
    multiselectable,
    initialSelected,
    initialActive,
    history: historyOptions
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<Multiselectable>['root'] = useSingleElement(),
        optionsApi: Listbox<Multiselectable>['options'] = useMultipleElements()


  // ACTIVE
  const ensuredInitialActive = ensureIndices(initialActive),
        active: Listbox<true>['active'] = ref(ensuredInitialActive),
        activate: Listbox<true>['activate'] = indexOrIndices => {
          const indices = ensureIndices(indexOrIndices)
          active.value = [...active.value, ...indices]
        },
        deactivate: Listbox<true>['deactivate'] = indexOrIndices => {
          if (indexOrIndices === undefined) {
            active.value = []
            return
          }

          const indices = ensureIndices(indexOrIndices)
          active.value = active.value.filter(index => !indices.includes(index))
        },
        status = shallowRef<'activating single' | 'activating multiple'>('activating single'),
        navigateable: Listbox<true>['navigateable'] = useNavigateable(optionsApi.elements.value)

  onMounted(() => {
    watchPostEffect(() => navigateable.value.setArray(optionsApi.elements.value))
  })

  watch(
    () => navigateable.value.location,
    () => {
      if (status.value === 'activating multiple') {
        // do nothing
        return
      }

      active.value = [navigateable.value.location]
    }
  )
  
  
  // SELECTED
  const ensuredInitialSelected = ensureIndices(initialSelected),
        selected: Listbox<true>['selected'] = ref(ensuredInitialSelected),
        select: Listbox<true>['select'] = indexOrIndices => {
          const indices = ensureIndices(indexOrIndices)
          selected.value = [...selected.value, ...indices]
        },
        deselect: Listbox<true>['deselect'] = indexOrIndices => {
          if (indexOrIndices === undefined) {
            selected.value = []
            return
          }

          const indices = ensureIndices(indexOrIndices)
          selected.value = selected.value.filter(index => !indices.includes(index))
        }


  // HISTORY
  const history: Listbox<true>['history'] = useHistory(historyOptions)

  watchEffect(() => history.record({
    active: active.value,
    selected: selected.value,
  }))

  watch(
    () => history.recorded.value.location,
    () => {
      const item = history.recorded.value.item
      active.value = item.active
      selected.value = item.selected
    },
  )
  

  return {
    root,
    options: optionsApi,
    active: computed(() => multiselectable ? active.value : active.value[0]),
    activate,
    deactivate,
    selected: computed(() => multiselectable ? selected.value : selected.value[0]),
    select,
    deselect,
    is: {
      selected: index => selected.value.includes(index),
      active: index => active.value.includes(index),
    },
    history,
    navigateable,
  } as Listbox<Multiselectable>
}

function ensureIndices (indexOrIndices: number | number[]): number[] {
  return Array.isArray(indexOrIndices)
    ? indexOrIndices
    : [indexOrIndices]
}
