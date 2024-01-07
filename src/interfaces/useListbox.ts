import type { ComputedRef } from 'vue'
import { computed, watch } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
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

export type Listbox<
  Multiselectable extends boolean = false,
  PopsUp extends boolean = false
> = ListboxBase
  & Omit<ListFeatures<Multiselectable>, 'is' | 'getStatuses'>
  & { getOptionStatuses: ListFeatures<Multiselectable>['getStatuses'] }
  & (
    PopsUp extends true
      ? {
        is: ListFeatures<Multiselectable>['is'] & Popup['is'],
        status: ComputedRef<Popup['status']['value']>
      } & Omit<Popup, 'is' | 'status'>
      : {
        is: ListFeatures<Multiselectable>['is'],
      }
  )

type ListboxBase = {
  root: ElementApi<HTMLElement, true, LabelMeta>,
  options: ListApi<
    HTMLElement,
    true,
    {
      candidate?: string,
      ability?: 'enabled' | 'disabled'
    } & LabelMeta
  >,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
} & ReturnType<typeof useListQuery>

export type UseListboxOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  PopsUp extends boolean = false
> = (
  UseListboxOptionsBase<Multiselectable, Clears, PopsUp>
    & Partial<Omit<
      UseListFeaturesConfig<Multiselectable, Clears>,
      | 'list'
      | 'disabledElementsReceiveFocus'
      | 'multiselectable'
      | 'clears'
      | 'query'
    >>
    & { initialPopupStatus?: UsePopupOptions['initialStatus'] }
)

type UseListboxOptionsBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  PopsUp extends boolean = false
> = {
  multiselectable?: Multiselectable,
  clears?: Clears,
  popsUp?: PopsUp,
  needsAriaOwns?: boolean,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
}

const defaultOptions: UseListboxOptions<false, true, false> = {
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
  Clears extends boolean = true,
  PopsUp extends boolean = false
> (options: UseListboxOptions<Multiselectable, Clears, PopsUp> = {}): Listbox<Multiselectable, PopsUp> {
  // OPTIONS
  const {
    initialSelected,
    multiselectable,
    clears,
    popsUp,
    initialPopupStatus,
    orientation,
    needsAriaOwns,
    loops,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<true, true>['root'] = useElementApi({
          identifies: true,
          defaultMeta: defaultLabelMeta,
        }),
        optionsApi: Listbox<true, true>['options'] = useListApi({
          identifies: true,
          defaultMeta: {
            candidate: '',
            ability: 'enabled',
            ...defaultLabelMeta,
          },
        })


  // QUERY
  const { query, results, type, paste, search } = useListQuery({
    rootApi: root,
    listApi: optionsApi,
    transfersFocus,
  })
  

  // MULTIPLE CONCERNS
  const { focused, focus, selected, select, deselect, is, getStatuses } = useListFeatures<true, true>({
    rootApi: root,
    listApi: optionsApi,
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
  const history: Listbox<true, true>['history'] = useHistory()

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
      ...toLabelBindValues(root),
      ariaMultiselectable: () => multiselectable || undefined,
      ariaOrientation: orientation,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => optionsApi.ids.value.join(' '))
        }
      })(),
    }
  )

  bind(
    optionsApi.list,
    {
      role: 'option',
      ...toLabelBindValues(optionsApi),
    }
  )


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
