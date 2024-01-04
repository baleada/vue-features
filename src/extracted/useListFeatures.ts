import { ref, nextTick, watch } from 'vue'
import type { Ref, ShallowReactive } from 'vue'
import { findIndex } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { createMap, Pickable } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import { createEligibleInListNavigateApi } from './createEligibleInListNavigateApi'
import { createEligibleInListPickApi } from './createEligibleInListPickApi'
import { listOn } from './listOn'
import { onListRendered } from './onListRendered'

export type ListFeatures<Multiselectable extends boolean = false> = Multiselectable extends true
  ? ListFeaturesBase & {
    select: ReturnType<typeof createEligibleInListPickApi>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : ListFeaturesBase & {
    select: Omit<ReturnType<typeof createEligibleInListPickApi>, 'exact'> & { exact: (index: number) => void },
    deselect: () => void,
  }

type ListFeaturesBase = {
  focused: ShallowReactive<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createEligibleInListNavigateApi>,
  selected: ShallowReactive<Pickable<HTMLElement>>,
  is: {
    focused: (index: number) => boolean,
    selected: (index: number) => boolean,
    enabled: (index: number) => boolean,
    disabled: (index: number) => boolean,
  }
  getStatuses: (index: number) => ['focused' | 'blurred', 'selected' | 'deselected', 'enabled' | 'disabled'],
}

export type UseListFeaturesConfig<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends { ability?: 'enabled' | 'disabled' } = { ability?: 'enabled' | 'disabled' }
> = Multiselectable extends true
  ? UseListFeaturesConfigBase<Multiselectable, Clears, Meta> & {
    initialSelected?: Clears extends true ? number | number[] | 'all' | 'none' : number | number[] | 'all',
  }
  : UseListFeaturesConfigBase<Multiselectable, Clears, Meta> & {
    initialSelected?: Clears extends true ? number | 'none' : number,
  }

type UseListFeaturesConfigBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends { ability?: 'enabled' | 'disabled' } = { ability?: 'enabled' | 'disabled' }
> = {
  rootApi: ElementApi<HTMLElement, true>,
  listApi: ListApi<HTMLElement, true, Meta>,
  orientation: 'horizontal' | 'vertical',
  multiselectable: Multiselectable,
  clears: Clears,
  popsUp: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  stopsPropagation: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function useListFeatures<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
  Meta extends { ability?: 'enabled' | 'disabled' } = { ability?: 'enabled' | 'disabled' }
> (
  {
    rootApi,
    listApi,
    initialSelected,
    orientation,
    multiselectable,
    clears,
    popsUp,
    selectsOnFocus,
    transfersFocus,
    stopsPropagation,
    disabledElementsReceiveFocus,
    loops,
    query,
  }: UseListFeaturesConfig<Multiselectable, Clears, Meta>
) {
  // ABILITY
  const isEnabled = ref<boolean[]>([]),
        isDisabled = ref<boolean[]>([]),
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


  // FOCUSED
  const focused: ListFeatures<true>['focused'] = useNavigateable(listApi.list.value),
        focus: ListFeatures<true>['focus'] = createEligibleInListNavigateApi({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          api: listApi,
        }),
        predicateFocused: ListFeatures<true>['is']['focused'] = index => focused.location === index,
        initialFocused = Array.isArray(initialSelected)
          ? initialSelected.length > 0
            ? initialSelected.at(-1)
            : 0
          : typeof initialSelected === 'number'
            ? initialSelected
            : 0,
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
        // Storage extensions might have already set location
        if (focused.location !== 0) {
          stopInitialFocusEffect()
          return
        }

        preventFocus()
        ;(() => {
          if (initialSelected === 'all') {
            const lastEnabledIndex = (() => {
              for (let i = listApi.list.value.length - 1; i >= 0; i--) {
                if (listApi.meta.value[i].ability === 'enabled') return i
              }

              return -1
            })()

            if (lastEnabledIndex >= 0) {
              focus.exact(lastEnabledIndex)
              return
            }

            if (disabledElementsReceiveFocus) focus.first()
          }

          const ability = focus.exact(initialFocused)
          if (ability === 'disabled') focus.first()
        })()
        nextTick(allowFocus)

        stopInitialFocusEffect()
      },
    }
  )

  if (transfersFocus) {
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


  // SELECTED
  const selected: ListFeatures<true>['selected'] = usePickable(listApi.list.value),
        select: ListFeatures<true>['select'] = createEligibleInListPickApi({
          pickable: selected,
          api: listApi,
        }),
        deselect: ListFeatures<true>['deselect'] = indexOrIndices => {
          if (!clears) {
            if (
              new Pickable(listApi.list.value)
                .pick(selected.picks)
                .omit(indexOrIndices)
                .picks.length === 0
            ) {
              return
            }
          }

          selected.omit(indexOrIndices)
        },
        predicateSelected: ListFeatures<true>['is']['selected'] = index => selected.picks.includes(index),
        preventSelectOnFocus = () => multiselectionStatus = 'selecting',
        allowSelectOnFocus = () => nextTick(() => multiselectionStatus = 'selected')

  let multiselectionStatus: 'selecting' | 'selected' = 'selected'

  if (selectsOnFocus) {
    watch(
      () => focused.location,
      () => {
        if (multiselectionStatus === 'selecting') return
        select.exact(focused.location, { replace: 'all' })
      }
    )
  }

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
        // Storage extensions might have already set picks
        if (selected.picks.length > 0) {
          stopInitialSelectEffect()
          return
        }

        switch (initialSelected) {
          case 'none':
            deselect(createMap<HTMLElement, number>((_, index) => index)(selected.array))
            break
          case 'all':
            select.exact(createMap<HTMLElement, number>((_, index) => index)(selected.array))
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

  if (transfersFocus) {
    listOn({
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
      deselect: multiselectable ? deselect : () => deselect(),
      predicateSelected,
      orientation,
      preventSelectOnFocus,
      allowSelectOnFocus,
      multiselectable,
      selectsOnFocus,
      stopsPropagation,
      clears,
      popsUp,
      query,
      getAbility: index => listApi.meta.value[index].ability || 'enabled',
    })
  }
  

  // API
  return {
    focused,
    focus,
    selected,
    select: {
      ...select,
      exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' }),
    },
    deselect: multiselectable ? deselect : () => deselect(),
    is: {
      focused: index => predicateFocused(index),
      selected: index => predicateSelected(index),
      enabled: index => predicateEnabled(index),
      disabled: index => predicateDisabled(index),
    },
    getStatuses,
  } as ListFeatures<Multiselectable>
}
