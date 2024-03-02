import { shallowRef, watch, nextTick, computed } from 'vue'
import type { ShallowReactive, Ref } from 'vue'
import type { MatchData } from 'fast-fuzzy'
import { findIndex, join } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { Pickable, createMap, createResults } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind, on } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import { useQuery } from './useQuery'
import type { Query } from './useQuery'
import { createEligibleInListNavigateApi } from './createEligibleInListNavigateApi'
import type { EligibleInListNavigateApi } from './createEligibleInListNavigateApi'
import { createEligibleInListPickApi } from './createEligibleInListPickApi'
import type { EligibleInListPickApi } from './createEligibleInListPickApi'
import { useListWithEvents } from './useListWithEvents'
import type { ListWithEvents } from './useListWithEvents'
import { onListRendered } from './onListRendered'
import { createToNextEligible, createToPreviousEligible } from './createToEligibleInList'
import type { ToListEligibility } from './createToEligibleInList'
import { predicateSpace } from './predicateKeycombo'
import type { Ability } from './ability'

export type ListFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? ListFeaturesBase & {
    select: EligibleInListPickApi,
    deselect: {
      exact: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
      all: () => void,
    }
  }
  : ListFeaturesBase & {
    select: Omit<EligibleInListPickApi, 'exact'> & {
      exact: (index: number) => void
    },
    deselect: {
      exact: (index: number) => void,
      all: () => void,
    }
  }

type ListFeaturesBase = (
  & Query
  & Omit<ListWithEvents, 'is'>
  & {
    focused: ShallowReactive<Navigateable<HTMLElement>>,
    focus: EligibleInListNavigateApi,
    results: Ref<MatchData<string>[]>,
    search: () => void,
    selected: ShallowReactive<Pickable<HTMLElement>>,
    status: Ref<'focusing' | 'selecting'>,
    focusing: () => 'focusing',
    selecting: () => 'selecting',
    toggle: () => 'focusing' | 'selecting',
    is: (
      & ListWithEvents['is']
      & {
        focused: (index: number) => boolean,
        selected: (index: number) => boolean,
        enabled: (index: number) => boolean,
        disabled: (index: number) => boolean,
        focusing: () => boolean,
        selecting: () => boolean,
      }
    ),
    getStatuses: (index: number) => ['focused' | 'blurred', 'selected' | 'deselected', Ability],
  }
)

export type UseListFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends { ability?: Ability, candidate?: string } = { ability?: Ability, candidate?: string }
> = Multiselectable extends true
  ? UseListFeaturesConfigBase<Multiselectable, Clears, Meta> & {
    initialSelected: Clears extends true
      ? number | number[] | 'all' | 'none'
      : number | number[] | 'all',
  }
  : UseListFeaturesConfigBase<Multiselectable, Clears, Meta> & {
    initialSelected: Clears extends true
      ? number | 'none'
      : number,
  }

type UseListFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends DefaultMeta = DefaultMeta
> = {
  rootApi: ElementApi<HTMLElement, true>,
  listApi: ListApi<HTMLElement, true, Meta>,
  clears: Clears,
  initialFocused: number | 'selected',
  initialStatus: ListStatus,
  disabledElementsReceiveFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  multiselectable: Multiselectable,
  needsAriaOwns: boolean,
  orientation: 'horizontal' | 'vertical',
  queryMatchThreshold: number,
  receivesFocus: boolean,
}

export type ListStatus = 'focusing' | 'selecting'

export type DefaultMeta = { ability?: Ability, candidate?: string }

export function useListFeatures<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends DefaultMeta = DefaultMeta
> (
  {
    rootApi,
    listApi,
    initialStatus,
    initialFocused,
    initialSelected,
    orientation,
    multiselectable,
    clears,
    receivesFocus,
    disabledElementsReceiveFocus,
    loops,
    queryMatchThreshold,
    needsAriaOwns,
  }: UseListFeaturesConfig<Multiselectable, Clears, Meta>
) {
  // ELIGIBILITY
  const toNextEligible = createToNextEligible({ api: listApi }),
        toPreviousEligible = createToPreviousEligible({ api: listApi })


  // BASIC BINDINGS
  bind(
    rootApi.element,
    {
      ariaOrientation: orientation,
      ariaMultiselectable: multiselectable ? 'true' : undefined,
      ariaOwns: needsAriaOwns ? computed(() => join(' ')(listApi.ids.value) as string) : undefined,
    },
  )


  // ABILITY
  const isEnabled = shallowRef<boolean[]>([]),
        isDisabled = shallowRef<boolean[]>([]),
        predicateEnabled: ListFeatures<true>['is']['enabled'] = index => isEnabled.value[index],
        predicateDisabled: ListFeatures<true>['is']['disabled'] = index => isDisabled.value[index]

  onListRendered(
    listApi.meta,
    {
      predicateRenderedWatchSourcesChanged: () => listApi.status.value.meta === 'changed',
      beforeItemEffects: () => {
        isEnabled.value = []
        isDisabled.value = []
      },
      itemEffect: ({ ability }, index) => {
        isEnabled.value[index] = ability === 'enabled'
        isDisabled.value[index] = ability === 'disabled'
      },
    }
  )

  bind(
    listApi.list,
    {
      ariaDisabled: index => listApi.meta.value[index].ability === 'disabled'
        ? 'true'
        : undefined,
    },
  )


  // STATUS
  const status: ListFeatures<true>['status'] = shallowRef(initialStatus),
        focusing = () => status.value = 'focusing',
        selecting = () => status.value = 'selecting',
        toggle = () => (
          status.value = status.value === 'focusing'
            ? 'selecting'
            : 'focusing'
        )


  // FOCUSED
  const focused: ListFeatures<true>['focused'] = useNavigateable(listApi.list.value),
        focus: ListFeatures<true>['focus'] = createEligibleInListNavigateApi({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          api: listApi,
          toNextEligible,
          toPreviousEligible,
        }),
        predicateFocused: ListFeatures<true>['is']['focused'] = index => focused.location === index,
        preventFocus = () => focusStatus = 'prevented',
        allowFocus = () => focusStatus = 'allowed'

  let focusStatus: 'allowed' | 'prevented' = 'allowed'

  onListRendered(
    listApi.list,
    {
      predicateRenderedWatchSourcesChanged: () => (
        listApi.status.value.order === 'changed'
        || listApi.status.value.length !== 'none'
      ),
      listEffect: () => focused.array = listApi.list.value,
    }
  )

  const stopInitialFocusEffect = onListRendered(
    listApi.list,
    {
      listEffect: () => {
        if (!listApi.list.value.length) return
        
        // Storage extensions might have already set location
        if (focused.location !== 0) {
          stopInitialFocusEffect()
          return
        }

        preventFocus()
        preventSelect()
        ;(() => {
          if (initialFocused !== 'selected') {
            focus.exact(initialFocused)
            return
          }

          if (initialSelected === 'all') {
            focus.last()
            return
          }

          if (initialSelected === 'none') {
            focus.first()
            return
          }

          if (Array.isArray(initialSelected)) {
            let ability: Ability | 'none' = 'none',
                index = initialSelected.length - 1
            
            while (ability === 'none' && index >= 0) {
              ability = focus.exact(initialSelected[index])
              index--
            }

            return
          }

          const ability = focus.exact(initialSelected as number)
          if (ability !== 'none') return
          focus.first()
        })()
        nextTick(allowFocus)
        nextTick(allowSelect)

        stopInitialFocusEffect()
      },
    }
  )

  if (receivesFocus) {
    watch(
      () => focused.location,
      () => {
        if (
          listApi.list.value[focused.location] === document.activeElement
          || focusStatus === 'prevented'
        ) return        
        listApi.list.value[focused.location]?.focus()
      }
    )
    
    bind(
      listApi.list,
      {
        tabindex: {
          get: index => index === focused.location ? 0 : -1,
          watchSource: () => focused.location,
        },
      }
    )
  }


  // QUERY
  const { query, type, paste } = useQuery(),
        results: ListFeatures<true>['results'] = shallowRef([]),
        search: ListFeatures<true>['search'] = () => {
          const candidates = toCandidates(listApi.meta.value)
          results.value = createResults(
            candidates,
            ({ sortKind }) => ({
              returnMatchData: true,
              threshold: 0,
              sortBy: sortKind.insertOrder,
            })
          )(query.value)
        },
        toCandidates = createMap<Meta, string>(({ candidate }, index) => candidate || listApi.list.value[index].textContent),
        predicateExceedsQueryMatchThreshold: ToListEligibility = index => {
          if (results.value.length === 0) return 'ineligible'

          return results.value[index].score >= queryMatchThreshold
            ? 'eligible'
            : 'ineligible'
        }

  watch(
    results,
    () => focus.next(
      focused.location - 1,
      { toEligibility: predicateExceedsQueryMatchThreshold }
    )
  )

  if (receivesFocus) {
    on(
      rootApi.element,
      {
        keydown: event => {
          if (
            event.key.length > 1
            || event.ctrlKey
            || event.metaKey
          ) return

          event.preventDefault()

          if (query.value.length === 0 && predicateSpace(event)) return
          
          type(event.key)
          search()
        },
      }
    )
  }


  // SELECTED
  const selected: ListFeatures<true>['selected'] = usePickable(listApi.list.value),
        select: ListFeatures<true>['select'] = createEligibleInListPickApi({
          pickable: selected,
          api: listApi,
          toNextEligible,
          toPreviousEligible,
        }),
        deselect: ListFeatures<true>['deselect'] = {
          exact: indexOrIndices => {
            if (
              !clears
              && new Pickable(listApi.list.value)
                .pick(selected.picks)
                .omit(indexOrIndices)
                .picks.length === 0
            ) return

            selected.omit(indexOrIndices)
          },
          all: () => {
            if (!clears) return
            selected.omit()
          },
        },
        predicateSelected: ListFeatures<true>['is']['selected'] = index => selected.picks.includes(index),
        preventSelect = () => selectStatus = 'prevented',
        allowSelect = () => selectStatus = 'allowed'

  let selectStatus: 'allowed' | 'prevented' = 'allowed'

  watch(
    () => focused.location,
    () => {
      if (
        status.value === 'focusing'
        || selectStatus === 'prevented'
      ) return
      select.exact(focused.location, { replace: 'all' })
    }
  )

  onListRendered(
    listApi.list,
    {
      predicateRenderedWatchSourcesChanged: () => listApi.status.value.length !== 'none',
      listEffect: () => selected.array = listApi.list.value,
    }
  )

  const stopInitialSelectEffect = onListRendered(
    listApi.list,
    {
      listEffect: () => {
        if (!listApi.list.value.length) return

        // Storage extensions might have already set picks
        if (selected.picks.length > 0) {
          stopInitialSelectEffect()
          return
        }

        switch (initialSelected) {
          case 'none':
            deselect.all()
            break
          case 'all':
            select.all()
            break
          default:
            select.exact(initialSelected)
            break
        }
        stopInitialSelectEffect()
      },
    }
  )

  bind(
    listApi.list,
    {
      ariaSelected: {
        get: index => predicateSelected(index) ? 'true' : undefined,
        watchSource: () => selected.picks,
      },
    }
  )


  // MULTIPLE CONCERNS
  const getStatuses: ListFeatures<true>['getStatuses'] = index => {
    return [
      predicateFocused(index) ? 'focused' : 'blurred',
      predicateSelected(index) ? 'selected' : 'deselected',
      listApi.meta.value[index].ability,
    ]
  }

  // TODO: way to avoid adding event listeners for combobox which does this separately
  // `receivesFocus` + generics probably.
  const withEvents = useListWithEvents({
    keyboardElement: rootApi.element,
    pointerElement: rootApi.element,
    getIndex: id => findIndex<string>(i => i === id)(listApi.ids.value) as number,
    focus,
    focused,
    select: {
      ...select,
      exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' }),
    },
    selected,
    deselect: multiselectable
      ? deselect
      : {
        exact: index => deselect.exact(index),
        all: () => deselect.all(),
      },
    predicateSelected,
    orientation,
    preventSelect,
    allowSelect,
    multiselectable,
    status,
    clears,
    query,
    toAbility: index => listApi.meta.value[index].ability || 'enabled',
    toNextEligible,
    toPreviousEligible,
  })
  

  // API
  return {
    focused,
    focus,
    query: computed(() => query.value),
    type,
    paste,
    results: computed(() => results.value),
    search,
    selected,
    status,
    focusing,
    selecting,
    toggle,
    select: {
      ...select,
      exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' }),
    },
    deselect: multiselectable
      ? deselect
      : {
        exact: index => deselect.exact(index),
        all: () => deselect.all(),
      },
    ...withEvents,
    is: {
      focused: index => predicateFocused(index),
      selected: index => predicateSelected(index),
      enabled: index => predicateEnabled(index),
      disabled: index => predicateDisabled(index),
      focusing: () => status.value === 'focusing',
      selecting: () => status.value === 'selecting',
      ...withEvents.is,
    },
    getStatuses,
  } as ListFeatures<Multiselectable>
}
