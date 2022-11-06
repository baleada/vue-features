// https://www.w3.org/WAI/ARIA/apg/patterns/menu/
import { ref, computed, ComputedRef, watch, onMounted } from 'vue'
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

export type Menubar<Popup extends boolean = false> = MenubarBase
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

type MenubarBase = {
  root: IdentifiedElementApi<HTMLElement>,
  items: IdentifiedListApi<
    HTMLElement,
    {
      candidate: string,
      ability: 'enabled' | 'disabled',
      // TODO: checked support
      kind: 'item' // | 'checkbox' | 'radio',
      checked: boolean,
      groupName: string,
    }
  >,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof useListQuery>

export type UseMenubarOptions<Popup extends boolean = false> = UseMenubarOptionsBase<Popup>
  & Partial<Omit<UseListStateConfig, 'list' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
  & { initialPopupTracking?: UsePopupTrackingOptions['initialStatus'] }

type UseMenubarOptionsBase<Popup extends boolean = false> = {
  popup?: Popup,
  history?: UseHistoryOptions,
  needsAriaOwns?: boolean,
  disabledItemsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseMenubarOptions<false> = {
  clears: true,
  initialSelected: 0,
  orientation: 'vertical',
  popup: false,
  initialPopupTracking: 'closed',
  needsAriaOwns: false,
  selectsOnFocus: false,
  transfersFocus: true,
  stopsPropagation: false,
  loops: false,
  disabledItemsReceiveFocus: true,
  queryMatchThreshold: 1,
}

export function useMenubar<
  Multiselectable extends boolean = false,
  Popup extends boolean = false
> (options: UseMenubarOptions<Popup> = {}): Menubar<Popup> {
  // OPTIONS
  const {
    initialSelected,
    clears,
    popup,
    initialPopupTracking,
    orientation,
    history: historyOptions,
    needsAriaOwns,
    loops,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledItemsReceiveFocus,
    queryMatchThreshold,
  } = ({ ...defaultOptions, ...options } as UseMenubarOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Menubar<true>['root'] = useElementApi({ identified: true }),
        items: Menubar<true>['items'] = useElementApi({
          kind: 'list',
          identified: true,
          defaultMeta: {
            candidate: '',
            ability: 'enabled',
            kind: 'item',
            checked: false,
            groupName: '',
          },
        })


  // QUERY
  const { query, searchable, type, paste, search } = useListQuery({ list: items })

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
    initialSelected,
    orientation,
    multiselectable: false,
    clears,
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
  const history: Menubar<true>['history'] = useHistory(historyOptions)

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
      role: index => items.meta.value[index].kind === 'item'
        ? 'menuitem'
        : `menuitem${items.meta.value[index].kind}`,
      id: index => items.ids.value[index],
      ariaChecked: index => items.meta.value?.[index]?.checked ? 'true' : undefined,
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
    } as unknown as Menubar<Popup>
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
  } as unknown as Menubar<Popup>
}
