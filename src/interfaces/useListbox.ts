import { computed, ComputedRef, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import type { MatchData } from 'fast-fuzzy'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  useListQuery,
  useListState,
  usePopupTracking,
} from '../extracted'
import type {
  IdentifiedElementApi,
  IdentifiedListApi,
  History,
  UseHistoryOptions,
  ToListEligibility,
  ListState,
  UseListStateConfig,
  PopupTracking,
  UsePopupTrackingOptions,
} from '../extracted'
import { findIndex } from 'lazy-collections'

export type Listbox<Multiselectable extends boolean = false, Popup extends boolean = false> = ListboxBase
  & Omit<ListState<Multiselectable>, 'is' | 'getStatuses'>
  & { getOptionStatuses: ListState<Multiselectable>['getStatuses'] }
  & (
    Popup extends true
      ? {
        is: ListState<Multiselectable>['is'] & PopupTracking['is'],
        status: ComputedRef<PopupTracking['status']['value']>
      } & Omit<PopupTracking, 'is' | 'status'>
      : {
        is: ListState<Multiselectable>['is'],
      }
  )

type ListboxBase = {
  root: IdentifiedElementApi<HTMLElement>,
  options: IdentifiedListApi<HTMLElement>,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof useListQuery>

export type UseListboxOptions<Multiselectable extends boolean = false, Popup extends boolean = false> = UseListboxOptionsBase<Multiselectable, Popup>
  & Partial<Omit<UseListStateConfig<Multiselectable>, 'list' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
  & { initialPopupTracking?: UsePopupTrackingOptions['initialStatus'] }

type UseListboxOptionsBase<Multiselectable extends boolean = false, Popup extends boolean = false> = {
  multiselectable?: Multiselectable,
  popup?: Popup,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
  toCandidate?: (index: number, element: HTMLElement) => string,
}

const defaultOptions: UseListboxOptions<false, false> = {
  multiselectable: false,
  clearable: true,
  initialSelected: 0,
  orientation: 'vertical',
  popup: false,
  initialPopupTracking: 'closed',
  needsAriaOwns: false,
  selectsOnFocus: false,
  transfersFocus: true,
  stopsPropagation: false,
  loops: false,
  ability: () => 'enabled',
  disabledOptionsReceiveFocus: true,
  queryMatchThreshold: 1,
  toCandidate: (index, element) => element.textContent,
}

export function useListbox<
  Multiselectable extends boolean = false,
  Popup extends boolean = false
> (options: UseListboxOptions<Multiselectable, Popup> = {}): Listbox<Multiselectable, Popup> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clearable,
    popup,
    initialPopupTracking,
    orientation,
    history: historyOptions,
    ability: abilityOption,
    needsAriaOwns,
    loops,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
    toCandidate,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<true, true>['root'] = useElementApi({ identified: true }),
        optionsApi: Listbox<true, true>['options'] = useElementApi({ kind: 'list', identified: true })


  // QUERY
  const { query, searchable, type, paste, search } = useListQuery({ list: optionsApi, toCandidate })

  if (transfersFocus) {
    on(
      root.element,
      {
        keydown: event => {
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
      }
    )
  }
  

  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, deselect, is, getStatuses } = useListState<true>({
    root,
    list: optionsApi,
    ability: abilityOption,
    initialSelected,
    orientation,
    multiselectable: multiselectable as true,
    clearable,
    popup,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    loops,
    query,
  })


  // FOCUSED
  if (transfersFocus) {
    watch(
      () => searchable.value.results,
      () => {
        const toEligibility: ToListEligibility = index => {
                if (searchable.value.results.length === 0) {
                  return 'ineligible'
                }

                return (searchable.value.results[index] as MatchData<string>)
                  .score >= queryMatchThreshold
                  ? 'eligible'
                  : 'ineligible'
              }
        
        const ability = focus.next(focused.value.location - 1, { toEligibility })
        if (ability === 'none' && !loops) {
          focus.first({ toEligibility })
        }
      }
    )
  }

  bind(
    root.element,
    { tabindex: -1 },
  )

  // TODO: better perf
  on(
    optionsApi.elements,
    {
      mouseover: event => {
        if (selectsOnFocus) return

        const index = findIndex<string>(id => id === (event.target as HTMLElement).id)(optionsApi.ids.value) as number
        if (index < 0) return

        focus.exact(index)
      }
    }
  )


  // POPUP STATUS
  const popupTracking = usePopupTracking({ initialStatus: initialPopupTracking })


  // HISTORY
  const history: Listbox<true, true>['history'] = useHistory(historyOptions)

  watch(
    () => history.entries.value.location,
    () => {
      const item = history.entries.value.item
      focused.value.navigate(item.focused)
      selected.value.pick(item.selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.value.location,
    selected: selected.value.picks,
  })
  

  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'listbox',
      ariaMultiselectable: () => multiselectable || undefined,
      ariaOrientation: orientation,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => optionsApi.ids.value.join(' '))
        }
      })()
    }
  )

  bind(
    optionsApi.elements,
    {
      role: 'option',
      id: index => optionsApi.ids.value[index],
    }
  )


  // API

  if (popup) {
    return {
      root,
      options: optionsApi,
      focused,
      focus,
      selected,
      select,
      deselect,
      open: () => popupTracking.open(),
      close: () => popupTracking.close(),
      is: {
        ...is,
        ...popupTracking.is,
      },
      status: computed(() => popupTracking.status.value),
      getOptionStatuses: getStatuses,
      history,
      query: computed(() => query.value),
      searchable,
      search,
      type,
      paste,
    } as unknown as Listbox<Multiselectable, Popup>
  }

  return {
    root,
    options: optionsApi,
    focused,
    focus,
    selected,
    select,
    deselect,
    is,
    getOptionStatuses: getStatuses,
    history,
    query: computed(() => query.value),
    searchable,
    search,
    type,
    paste,
  } as unknown as Listbox<Multiselectable, Popup>
}
