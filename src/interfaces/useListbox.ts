import type { ComputedRef } from 'vue'
import { computed, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  useListQuery,
  useListState,
  usePopup,
} from '../extracted'
import type {
  IdentifiedElementApi,
  IdentifiedListApi,
  History,
  UseHistoryOptions,
  ToListEligibility,
  ListState,
  UseListStateConfig,
  Popup,
  UsePopupOptions,
} from '../extracted'

export type Listbox<Multiselectable extends boolean = false, PopsUp extends boolean = false> = ListboxBase
  & Omit<ListState<Multiselectable>, 'is' | 'getStatuses'>
  & { getOptionStatuses: ListState<Multiselectable>['getStatuses'] }
  & (
    PopsUp extends true
      ? {
        is: ListState<Multiselectable>['is'] & Popup['is'],
        status: ComputedRef<Popup['status']['value']>
      } & Omit<Popup, 'is' | 'status'>
      : {
        is: ListState<Multiselectable>['is'],
      }
  )

type ListboxBase = {
  root: IdentifiedElementApi<HTMLElement>,
  options: IdentifiedListApi<
    HTMLElement,
    { candidate: string, ability: 'enabled' | 'disabled' }
  >,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof useListQuery>

export type UseListboxOptions<Multiselectable extends boolean = false, PopsUp extends boolean = false> = (
  UseListboxOptionsBase<Multiselectable, PopsUp>
    & Partial<Omit<UseListStateConfig<Multiselectable>, 'list' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
    & { initialPopupStatus?: UsePopupOptions['initialStatus'] }
)

type UseListboxOptionsBase<Multiselectable extends boolean = false, PopsUp extends boolean = false> = {
  multiselectable?: Multiselectable,
  popsUp?: PopsUp,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseListboxOptions<false, false> = {
  multiselectable: false,
  clears: true,
  initialSelected: 0,
  orientation: 'vertical',
  popsUp: false,
  initialPopupStatus: 'closed',
  needsAriaOwns: false,
  selectsOnFocus: false,
  transfersFocus: true,
  stopsPropagation: false,
  loops: false,
  disabledOptionsReceiveFocus: true,
  queryMatchThreshold: 1,
}

export function useListbox<
  Multiselectable extends boolean = false,
  PopsUp extends boolean = false
> (options: UseListboxOptions<Multiselectable, PopsUp> = {}): Listbox<Multiselectable, PopsUp> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clears,
    popsUp,
    initialPopupStatus,
    orientation,
    history: historyOptions,
    needsAriaOwns,
    loops,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<true, true>['root'] = useElementApi({ identifies: true }),
        optionsApi: Listbox<true, true>['options'] = useElementApi({
          kind: 'list',
          identifies: true,
          defaultMeta: { candidate: '', ability: 'enabled' },
        })


  // QUERY
  const { query, results, type, paste, search } = useListQuery({ list: optionsApi })

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
        },
      }
    )
  }
  

  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, deselect, is, getStatuses } = useListState<true>({
    root,
    list: optionsApi,
    initialSelected,
    orientation,
    multiselectable: multiselectable as true,
    clears,
    popsUp,
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
      results,
      () => {
        const toEligibility: ToListEligibility = index => {
                if (results.value.length === 0) {
                  return 'ineligible'
                }

                return (results.value[index])
                  .score >= queryMatchThreshold
                  ? 'eligible'
                  : 'ineligible'
              }
        
        const ability = focus.next(focused.location - 1, { toEligibility })
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


  // POPUP STATUS
  const popup = usePopup({ initialStatus: initialPopupStatus })


  // HISTORY
  const history: Listbox<true, true>['history'] = useHistory(historyOptions)

  watch(
    () => history.entries.location,
    () => {
      const item = history.entries.item
      focused.navigate(item.focused)
      selected.pick(item.selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.location,
    selected: selected.picks,
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
      })(),
    }
  )

  bind(optionsApi.elements, { role: 'option' })


  // API

  if (popsUp) {
    return {
      root,
      options: optionsApi,
      focused,
      focus,
      selected,
      select,
      deselect,
      open: () => popup.open(),
      close: () => popup.close(),
      is: {
        ...is,
        ...popup.is,
      },
      status: computed(() => popup.status.value),
      getOptionStatuses: getStatuses,
      history,
      query: computed(() => query.value),
      results,
      search,
      type,
      paste,
    } as unknown as Listbox<Multiselectable, PopsUp>
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
    results,
    search,
    type,
    paste,
  } as unknown as Listbox<Multiselectable, PopsUp>
}
