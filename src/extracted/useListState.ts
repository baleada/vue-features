import { ref, nextTick, onMounted, watch, watchPostEffect } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { createMap, Pickable } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import type { IdentifiedElementApi, IdentifiedListApi } from './useElementApi'
import { createEligibleInListNavigation } from './createEligibleInListNavigation'
import { createEligibleInListPicking } from './createEligibleInListPicking'
import { listOn } from './listOn'

export type ListState<Multiselectable extends boolean = false> = Multiselectable extends true
  ? ListStateBase & {
    select: ReturnType<typeof createEligibleInListPicking>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : ListStateBase & {
    select: Omit<ReturnType<typeof createEligibleInListPicking>, 'exact'> & { exact: (index: number) => void },
    deselect: () => void,
  }

type ListStateBase = {
  focused: Ref<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createEligibleInListNavigation>,
  selected: Ref<Pickable<HTMLElement>>,
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
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' },
> = Multiselectable extends true
  ? UseListStateConfigBase<Multiselectable, Meta> & {
    initialSelected?: number | number[] | 'none' | 'all',
  }
  : UseListStateConfigBase<Multiselectable, Meta> & {
    initialSelected?: number | 'none',
  }

type UseListStateConfigBase<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' },
> = {
  root: IdentifiedElementApi<HTMLElement>,
  list: IdentifiedListApi<HTMLElement, Meta>,
  orientation: 'horizontal' | 'vertical',
  multiselectable: Multiselectable,
  clears: boolean,
  popup: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  stopsPropagation: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function useListState<
  Multiselectable extends boolean = false,
  Meta extends { ability: 'enabled' | 'disabled' } = { ability: 'enabled' | 'disabled' },
> (
  {
    root,
    list,
    initialSelected,
    orientation,
    multiselectable,
    clears,
    popup,
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
    list.meta,
    () => {
      if (list.status.value.meta === 'changed') {
        isEnabled.value = []
        isDisabled.value = []

        for (let i = 0; i < list.meta.value.length; i++) {
          isEnabled.value[i] = list.meta.value[i].ability === 'enabled'
          isDisabled.value[i] = list.meta.value[i].ability === 'disabled'
        }
      }
    },
    { flush: 'post' }
  )

  bind(
    list.elements,
    {
      ariaDisabled: index => list.meta.value?.[index]?.ability === 'disabled'
        ? 'true'
        : undefined,
    },
  )


  // FOCUSED
  const focused: ListState<true>['focused'] = useNavigateable(list.elements.value),
        focus: ListState<true>['focus'] = createEligibleInListNavigation({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          list,
        }),
        predicateFocused: ListState<true>['is']['focused'] = index => focused.value.location === index

  onMounted(() => {
    watchPostEffect(() => focused.value.array = list.elements.value)

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
      [() => focused.value.array.length],
      () => {
        // Storage extensions might have already set location
        if (focused.value.location !== 0) {
          nextTick(stop)
        }

        if (focused.value.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            focused.value.navigate(initialFocused)
            stop()
          })
        }
      },
      { immediate: true, flush: 'post' }
    )

    if (transfersFocus) {
      watch(
        () => focused.value.location,
        () => {
          if (list.elements.value[focused.value.location] === document.activeElement) {
            return
          }
          
          list.elements.value[focused.value.location]?.focus()
        },
        { flush: 'post' }
      )
    }
  })

  if (transfersFocus){
    bind(
      list.elements,
      {
        tabindex: {
          get: index => index === focused.value.location ? 0 : -1,
          watchSource: () => focused.value.location,
        },
      }
    )
  }


  // SELECTED
  const selected: ListState<true>['selected'] = usePickable(list.elements.value),
        select: ListState<true>['select'] = createEligibleInListPicking({
          pickable: selected,
          list,
        }),
        deselect: ListState<true>['deselect'] = indexOrIndices => {
          if (!clears) {
            if (
              new Pickable(list.elements.value)
                .pick(selected.value.picks)
                .omit(indexOrIndices)
                .picks.length === 0
            ) {
              return
            }
          }

          selected.value.omit(indexOrIndices)
        },
        predicateSelected: ListState<true>['is']['selected'] = index => selected.value.picks.includes(index),
        multiselectionStatus: { cached: 'selected' | 'selecting' } = { cached: 'selected' },
        preventSelectOnFocus = () => multiselectionStatus.cached = 'selecting',
        allowSelectOnFocus = () => nextTick(() => multiselectionStatus.cached = 'selected')

  if (selectsOnFocus) {
    watch(
      () => focused.value.location,
      () => {
        if (multiselectionStatus.cached === 'selecting') return
        select.exact(focused.value.location, { replace: 'all' })
      }
    )
  }

  onMounted(() => {
    watchPostEffect(() => selected.value.array = list.elements.value)

    // Account for conditional rendering
    const stop = watch(
      () => selected.value.array,
      () => {
        // Storage extensions might have already set picks
        if (selected.value.picks.length > 0) {
          nextTick(stop)
          return
        }

        if (selected.value.array.length > 0) {
          // Allow post effect to set array
          nextTick(() => {
            switch (initialSelected) {
              case 'none':
                selected.value.pick([])
                break
              case 'all':
                selected.value.pick(createMap<HTMLElement, number>((_, index) => index)(selected.value.array))
                break
              default:
                selected.value.pick(initialSelected)
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
    list.elements,
    {
      ariaSelected: {
        get: index => predicateSelected(index) ? 'true' : undefined,
        watchSource: () => selected.value.picks,
      },
    }
  )


  // MULTIPLE CONCERNS
  const getStatuses: ListState<true>['getStatuses'] = index => {
    return [
      predicateFocused(index) ? 'focused' : 'blurred',
      predicateSelected(index) ? 'selected' : 'deselected',
      list.meta.value[index].ability,
    ]
  }

  if (transfersFocus) {
    listOn({
      keyboardElement: root.element,
      pointerElement: root.element,
      getIndex: id => findIndex<string>(i => i === id)(list.ids.value) as number,
      focus,
      focused,
      select: {
        ...select,
        exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' })
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
      popup,
      query,
      getAbility: index => list.meta.value[index].ability,
    })
  }
  

  // API
  return {
    focused,
    focus,
    selected,
    select: {
      ...select,
      exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' })
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
