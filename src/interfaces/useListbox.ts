import { computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import type { MatchData } from 'fast-fuzzy'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  useQuery,
  useFocusedAndSelected
} from '../extracted'
import type {
  SingleElementApi,
  MultipleIdentifiedElementsApi,
  History,
  UseHistoryOptions,
  ToEligibility,
  FocusedAndSelected,
  UseFocusedAndSelectedConfig,
} from '../extracted'


export type Listbox<Multiselectable extends boolean = false> = ListboxBase
  & Omit<FocusedAndSelected<Multiselectable>, 'focused' | 'selected'>

type ListboxBase = {
  root: SingleElementApi<HTMLElement>,
  options: MultipleIdentifiedElementsApi<HTMLElement>,
  query: Ref<string>,
  type: (character: string) => void,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
}

export type UseListboxOptions<Multiselectable extends boolean = false> = UseListboxOptionsBase<Multiselectable>
  & Partial<Omit<UseFocusedAndSelectedConfig<Multiselectable>, 'elementsApi' | 'disabledElementsReceiveFocus' | 'multiselectable'>>

type UseListboxOptionsBase<Multiselectable extends boolean = false> = {
  multiselectable?: Multiselectable,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
  toCandidate?: ({ element: HTMLElement, index: number }) => string,
}

const defaultOptions: UseListboxOptions<false> = {
  multiselectable: false,
  initialSelected: 0,
  orientation: 'vertical',
  needsAriaOwns: false,
  loops: false,
  ability: 'enabled',
  disabledOptionsReceiveFocus: true,
  queryMatchThreshold: 1,
  toCandidate: ({ element }) => element.textContent,
}

export function useListbox<Multiselectable extends boolean = false> (options: UseListboxOptions<Multiselectable> = {}): Listbox<Multiselectable> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    orientation,
    history: historyOptions,
    ability: abilityOption,
    needsAriaOwns,
    loops,
    selectsOnFocus,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
    toCandidate,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<true>['root'] = useElementApi(),
        optionsApi: Listbox<true>['options'] = useElementApi({ multiple: true, identified: true })


  // QUERY
  const { query, searchable, type, search } = useQuery({ elementsApi: optionsApi, toCandidate })

  on<'keydown'>({
    element: optionsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'keydown',
        event => {
          if (
            (event.key.length === 1 || !/^[A-Z]/i.test(event.key))
            && !event.ctrlKey && !event.metaKey
          ) {
            event.preventDefault()

            if (query.value.length === 0 && event.key === ' ') {
              return
            }
            
            type(event.key)
            search()
          }
        }
      )
    ]
  })


  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, deselect, is, getStatuses } = useFocusedAndSelected<true>({
    elementsApi: optionsApi,
    ability: abilityOption,
    initialSelected,
    orientation,
    multiselectable: multiselectable as true,
    selectsOnFocus,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    loops,
  })


  // FOCUSED
  watch(
    () => searchable.value.results,
    () => {
      const toEligibility: ToEligibility = ({ index }) => {
              return (searchable.value.results[index] as MatchData<string>).score >= queryMatchThreshold ? 'eligible' : 'ineligible'
            }
      
      const ability = focus.next(focused.value.location, { toEligibility })
      if (ability === 'none' && !loops) {
        focus.first({ toEligibility })
      }
    }
  )

  bind({
    element: root.element,
    values: { tabindex: -1 },
  })

  on<'mouseenter'>({
    element: optionsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'mouseenter',
        {
          createEffect: ({ index }) => () => {
            if (selectsOnFocus) {
              return
            }

            focus.exact(index)
          }
        }
      )
    ]
  })


  // HISTORY
  const history: Listbox<true>['history'] = useHistory(historyOptions)

  watch(
    () => history.recorded.value.location,
    () => {
      const item = history.recorded.value.item
      focused.value.navigate(item.focused)
      selected.value.pick(item.selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.value.location,
    selected: selected.value.picks,
  })
  

  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      role: 'listbox',
      ariaMultiselectable: () => multiselectable || undefined,
      ariaOrientation: orientation,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => optionsApi.ids.value.join(' '))
        }
      })()
    }
  })

  bind({
    element: optionsApi.elements,
    values: {
      role: 'option',
      id: ({ index }) => optionsApi.ids.value[index],
    }
  })


  // API
  return {
    root,
    options: optionsApi,
    focused: computed(() => focused.value.location),
    focus,
    selected: computed(() => multiselectable ? selected.value.picks : selected.value.picks[0]),
    select: {
      ...select,
      exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' })
    },
    deselect,
    is,
    getStatuses,
    history,
    query: computed(() => query.value),
    type,
  } as unknown as Listbox<Multiselectable>
}
