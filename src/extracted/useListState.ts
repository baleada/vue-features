import { ref, nextTick, onMounted, watch, watchPostEffect } from 'vue'
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

export type ListState<Multiselectable extends boolean = false> = Multiselectable extends true
  ? ListStateBase & {
    select: ReturnType<typeof createEligibleInListPickApi>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : ListStateBase & {
    select: Omit<ReturnType<typeof createEligibleInListPickApi>, 'exact'> & { exact: (index: number) => void },
    deselect: () => void,
  }

type ListStateBase = {
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

export type UseListStateConfig<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' }
> = Multiselectable extends true
  ? UseListStateConfigBase<Multiselectable, Meta> & {
    initialSelected?: number | number[] | 'none' | 'all',
  }
  : UseListStateConfigBase<Multiselectable, Meta> & {
    initialSelected?: number | 'none',
  }

type UseListStateConfigBase<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' }
> = {
  rootApi: ElementApi<HTMLElement, true>,
  listApi: ListApi<HTMLElement, true, Meta>,
  orientation: 'horizontal' | 'vertical',
  multiselectable: Multiselectable,
  clears: boolean,
  popsUp: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  stopsPropagation: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function useListState<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' }
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
  }: UseListStateConfig<Multiselectable, Meta>
) {
  // ABILITY
  const isEnabled = ref<boolean[]>([]),
        isDisabled = ref<boolean[]>([])

  watch(
    listApi.meta,
    () => {
      if (listApi.status.value.meta === 'changed') {
        isEnabled.value = []
        isDisabled.value = []

        for (let i = 0; i < listApi.meta.value.length; i++) {
          isEnabled.value[i] = listApi.meta.value[i].ability === 'enabled'
          isDisabled.value[i] = listApi.meta.value[i].ability === 'disabled'
        }
      }
    },
    { flush: 'post' }
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
  const focused: ListState<true>['focused'] = useNavigateable(listApi.list.value),
        focus: ListState<true>['focus'] = createEligibleInListNavigateApi({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          api: listApi,
        }),
        predicateFocused: ListState<true>['is']['focused'] = index => focused.location === index

  onMounted(() => {
    watchPostEffect(() => focused.array = listApi.list.value)

    const initialFocused = (() => {
      if (Array.isArray(initialSelected)) {
        if (initialSelected.length > 0) {
          return initialSelected[initialSelected.length - 1]
        }

        return 0
      }

      if (typeof initialSelected === 'number') {
        return initialSelected
      }

      return 0
    })()
    
    // Account for conditional rendering
    const stop = watch(
      [() => focused.array.length],
      () => {
        // Storage extensions might have already set location
        if (focused.location !== 0) {
          nextTick(stop)
        }

        if (focused.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            focused.navigate(initialFocused)
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )

    if (transfersFocus) {
      watch(
        () => focused.location,
        () => {
          if (listApi.list.value[focused.location] === document.activeElement) {
            return
          }
          
          listApi.list.value[focused.location]?.focus()
        },
        { flush: 'post' }
      )
    }
  })

  if (transfersFocus){
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
  const selected: ListState<true>['selected'] = usePickable(listApi.list.value),
        select: ListState<true>['select'] = createEligibleInListPickApi({
          pickable: selected,
          api: listApi,
        }),
        deselect: ListState<true>['deselect'] = indexOrIndices => {
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
        predicateSelected: ListState<true>['is']['selected'] = index => selected.picks.includes(index),
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

  onMounted(() => {
    watchPostEffect(() => selected.array = listApi.list.value)

    // Account for conditional rendering
    const stop = watch(
      () => selected.array,
      () => {
        // Storage extensions might have already set picks
        if (selected.picks.length > 0) {
          nextTick(stop)
          return
        }

        if (selected.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            switch (initialSelected) {
              case 'none':
                selected.pick([])
                break
              case 'all':
                selected.pick(createMap<HTMLElement, number>((_, index) => index)(selected.array))
                break
              default:
                selected.pick(initialSelected)
                break
            }
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )
  })

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
  const getStatuses: ListState<true>['getStatuses'] = index => {
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
      enabled: index => isEnabled.value[index],
      disabled: index => isDisabled.value[index],
    },
    getStatuses,
  } as ListState<Multiselectable>
}
