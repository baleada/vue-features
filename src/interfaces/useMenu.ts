// https://www.w3.org/WAI/ARIA/apg/patterns/menu/

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

export type Menu<Popup extends boolean = false> = MenuBase
  & Omit<ListState, 'is' | 'getStatuses'>
  & { getItemStatuses: ListState['getStatuses'] }
  & (
    Popup extends true
      ? {
        is: ListState['is'] & PopupTracking['is'],
        status: ComputedRef<PopupTracking['status']['value']>
      } & Omit<PopupTracking, 'is' | 'status'>
      : {
        is: ListState['is'],
      }
  )

type MenuBase = {
  root: IdentifiedElementApi<HTMLElement>,
  items: IdentifiedListApi<
    HTMLElement,
    {
      role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio',
      checked: boolean,
      groupName: string,
    }
  >,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof useListQuery>

export type UseMenuOptions<Popup extends boolean = false> = UseMenuOptionsBase<Popup>
  & Partial<Omit<UseListStateConfig, 'list' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
  & { initialPopupTracking?: UsePopupTrackingOptions['initialStatus'] }

type UseMenuOptionsBase<Popup extends boolean = false> = {
  popup?: Popup,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledItemsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
  toCandidate?: (index: number, element: HTMLElement) => string,
}

const defaultOptions: UseMenuOptions<false> = {
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
  disabledItemsReceiveFocus: true,
  queryMatchThreshold: 1,
  toCandidate: (index, element) => element.textContent,
}

export function useMenu<
  Multiselectable extends boolean = false,
  Popup extends boolean = false
> (options: UseMenuOptions<Popup> = {}): Menu<Popup> {
  // OPTIONS
  const {
    initialSelected,
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
    disabledItemsReceiveFocus,
    queryMatchThreshold,
    toCandidate,
  } = ({ ...defaultOptions, ...options } as UseMenuOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Menu<true>['root'] = useElementApi({ identified: true }),
        items: Menu<true>['items'] = useElementApi({
          kind: 'list',
          identified: true,
          defaultMeta: { role: 'menuitem', checked: false, groupName: '' },
        })


  // QUERY
  const { query, searchable, type, paste, search } = useListQuery({ list: items, toCandidate })

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
  const { focused, focus, selected, select, deselect, is, getStatuses } = useListState({
    root,
    list: items,
    ability: abilityOption,
    initialSelected,
    orientation,
    multiselectable: false,
    clearable,
    popup,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledElementsReceiveFocus: disabledItemsReceiveFocus,
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


  // POPUP STATUS
  const popupTracking = usePopupTracking({ initialStatus: initialPopupTracking })


  // HISTORY
  const history: Menu<true>['history'] = useHistory(historyOptions)

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
      role: popup ? 'menu' : 'menubar',
      ariaOrientation: orientation,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => items.ids.value.join(' '))
        }
      })()
    }
  )

  bind(
    items.elements,
    {
      role: index => items.meta.value[index].role,
      id: index => items.ids.value[index],
      ariaChecked: index =>
        (
          ['menuitemcheckbox', 'menuitemradio'].includes(items.meta.value[index].role)
          && items.meta.value[index].checked
        ) ? 'true' : undefined,
    }
  )


  // API

  if (popup) {
    return {
      root,
      items,
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
      getItemStatuses: getStatuses,
      history,
      query: computed(() => query.value),
      searchable,
      search,
      type,
      paste,
    } as unknown as Menu<Popup>
  }

  return {
    root,
    items,
    focused,
    focus,
    selected,
    select,
    deselect,
    is,
    getItemStatuses: getStatuses,
    history,
    query: computed(() => query.value),
    searchable,
    search,
    type,
    paste,
  } as unknown as Menu<Popup>
}
