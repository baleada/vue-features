// https://www.w3.org/WAI/ARIA/apg/patterns/menu/
import type { ComputedRef } from 'vue'
import { computed, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import type { MatchData } from 'fast-fuzzy'
import { bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  useListApi,
  useListQuery,
  useListFeatures,
  usePopup,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type {
  ElementApi,
  ListApi,
  History,
  ToListEligibility,
  ListFeatures,
  UseListFeaturesConfig,
  Popup,
  UsePopupOptions,
  LabelMeta,
} from '../extracted'

export type Menubar<PopsUp extends boolean = false> = MenubarBase
  & Omit<ListFeatures, 'is' | 'getStatuses'>
  & { getItemStatuses: ListFeatures['getStatuses'] }
  & (
    PopsUp extends true
      ? {
        is: ListFeatures['is'] & Popup['is'],
        status: ComputedRef<Popup['status']['value']>
      } & Omit<Popup, 'is' | 'status'>
      : {
        is: ListFeatures['is'],
      }
  )

type MenubarBase = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
  items: ListApi<
    HTMLElement,
    true,
    {
      candidate?: string,
      ability?: 'enabled' | 'disabled',
      // TODO: checked support
      kind?: 'item' // | 'checkbox' | 'radio',
      checked?: boolean,
      groupName?: string,
    } & LabelMeta
  >,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof useListQuery>

export type UseMenubarOptions<PopsUp extends boolean = false> = UseMenubarOptionsBase<PopsUp>
  & Partial<Omit<UseListFeaturesConfig, 'list' | 'disabledElementsReceiveFocus' | 'multiselectable' | 'query'>>
  & { initialPopupStatus?: UsePopupOptions['initialStatus'] }

type UseMenubarOptionsBase<PopsUp extends boolean = false> = {
  popsUp?: PopsUp,
  needsAriaOwns?: boolean,
  disabledItemsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseMenubarOptions<false> = {
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
  disabledItemsReceiveFocus: true,
  queryMatchThreshold: 1,
}

export function useMenubar<
  Multiselectable extends boolean = false,
  PopsUp extends boolean = false
> (options: UseMenubarOptions<PopsUp> = {}): Menubar<PopsUp> {
  // OPTIONS
  const {
    initialSelected,
    clears,
    popsUp,
    initialPopupStatus,
    orientation,
    needsAriaOwns,
    loops,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledItemsReceiveFocus,
    queryMatchThreshold,
  } = ({ ...defaultOptions, ...options } as UseMenubarOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Menubar<true>['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
        items: Menubar<true>['items'] = useListApi({
          identifies: true,
          defaultMeta: {
            candidate: '',
            ability: 'enabled',
            kind: 'item',
            checked: false,
            groupName: '',
            ...defaultLabelMeta,
          },
        })


  // QUERY
  const { query, results, type, paste, search } = useListQuery({
    rootApi: root,
    listApi: items,
    transfersFocus,
  })
  

  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, deselect, is, getStatuses } = useListFeatures({
    rootApi: root,
    listApi: items,
    initialSelected,
    orientation,
    multiselectable: false,
    clears,
    popsUp,
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
      results,
      () => {
        const toEligibility: ToListEligibility = index => {
                if (results.value.length === 0) {
                  return 'ineligible'
                }

                return (results.value[index] as MatchData<string>)
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
  const history: Menubar<true>['history'] = useHistory()

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
      role: popsUp ? 'menu' : 'menubar',
      ...toLabelBindValues(root),
      ariaOrientation: orientation,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => items.ids.value.join(' '))
        }
      })(),
    }
  )

  bind(
    items.list,
    {
      role: index => items.meta.value[index].kind === 'item'
        ? 'menuitem'
        : `menuitem${items.meta.value[index].kind}`,
      ...toLabelBindValues(items),
      ariaChecked: index => items.meta.value[index].checked ? 'true' : undefined,
    }
  )


  // API
  if (popsUp) {
    return {
      root,
      items,
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
      getItemStatuses: getStatuses,
      history,
      query: computed(() => query.value),
      results,
      search,
      type,
      paste,
    } as unknown as Menubar<PopsUp>
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
    results,
    search,
    type,
    paste,
  } as unknown as Menubar<PopsUp>
}
