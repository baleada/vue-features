import { nextTick, onMounted, watch, watchPostEffect } from 'vue'
import type { Ref } from 'vue'
import { findIndex } from 'lazy-collections'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { Pickable } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import type { IdentifiedElementApi, IdentifiedListApi } from './useElementApi'
import { createEligibleInListNavigation } from './createEligibleInListNavigation'
import { createEligibleInListPicking } from './createEligibleInListPicking'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'
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

export type UseListStateConfig<Multiselectable extends boolean = false> = Multiselectable extends true
  ? UseListStateConfigBase<Multiselectable> & {
    initialSelected?: number | number[] | 'none',
  }
  : UseListStateConfigBase<Multiselectable> & {
    initialSelected?: number | 'none',
  }

type UseListStateConfigBase<Multiselectable extends boolean = false> = {
  root: IdentifiedElementApi<HTMLElement>,
  list: IdentifiedListApi<HTMLElement>,
  ability: StatusOption<IdentifiedListApi<HTMLElement>['elements'], 'enabled' | 'disabled'>,
  orientation: 'horizontal' | 'vertical',
  multiselectable: Multiselectable,
  clearable: boolean,
  popup: boolean,
  selectsOnFocus: boolean,
  transfersFocus: boolean,
  loops: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
  disabledElementsReceiveFocus: boolean,
  query?: Ref<string>,
}

export function useListState<Multiselectable extends boolean = false> (
  {
    root,
    list,
    ability,
    initialSelected,
    orientation,
    multiselectable,
    clearable,
    popup,
    selectsOnFocus,
    transfersFocus,
    disabledElementsReceiveFocus,
    loops,
    query,
  }: UseListStateConfig<Multiselectable>
) {
  // ABILITY
  const getAbility = ensureGetStatus(list.elements, ability)

  bind(
    list.elements,
    {
      ariaDisabled: {
        get: index => getAbility(index) === 'disabled' ? true : undefined,
        watchSource: ensureWatchSourcesFromStatus(ability),
      },
    },
  )


  // FOCUSED
  const focused: ListState<true>['focused'] = useNavigateable(list.elements.value),
        focus: ListState<true>['focus'] = createEligibleInListNavigation({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          ability,
          list,
        }),
        isFocused: ListState<true>['is']['focused'] = index => focused.value.location === index

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
    
    nextTick(() => focused.value.navigate(initialFocused))

    if (transfersFocus) {
      watch(
        () => focused.value.location,
        () => {
          if (list.elements.value[focused.value.location]?.isSameNode(document.activeElement)) {
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
          ability,
          list,
        }),
        deselect: ListState<true>['deselect'] = indexOrIndices => {
          if (!clearable) {
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
        isSelected: ListState<true>['is']['selected'] = index => selected.value.picks.includes(index),
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
    selected.value.pick(initialSelected === 'none' ? [] : initialSelected)
  })

  bind(
    list.elements,
    {
      ariaSelected: {
        get: index => isSelected(index) ? 'true' : undefined,
        watchSource: () => selected.value.picks,
      },
    }
  )


  // MULTIPLE CONCERNS
  const getStatuses: ListState<true>['getStatuses'] = index => {
    return [
      isFocused(index) ? 'focused' : 'blurred',
      isSelected(index) ? 'selected' : 'deselected',
      getAbility(index),
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
      isSelected,
      orientation,
      preventSelectOnFocus,
      allowSelectOnFocus,
      multiselectable,
      selectsOnFocus,
      clearable,
      popup,
      query,
      getAbility,
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
      focused: index => isFocused(index),
      selected: index => isSelected(index),
      enabled: index => getAbility(index) === 'enabled',
      disabled: index => getAbility(index) === 'disabled',
    },
    getStatuses,
  } as ListState<Multiselectable>
}
