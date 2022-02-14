import { onMounted, watch, watchPostEffect } from 'vue'
import type { Ref } from 'vue'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { Pickable } from '@baleada/logic'
import type { Navigateable } from '@baleada/logic'
import { bind } from '../affordances'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { createEligibleNavigation } from './createEligibleNavigation'
import { createEligiblePicking } from './createEligiblePicking'
import { ensureGetStatus } from './ensureGetStatus'
import type { StatusOption } from './ensureGetStatus'
import { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'
import { focusedAndSelectedOn } from '.'

export type FocusedAndSelected<Multiselectable extends boolean = false> = Multiselectable extends true
  ? FocusedAndSelectedBase & {
    select: ReturnType<typeof createEligiblePicking>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : FocusedAndSelectedBase & {
    select: Omit<ReturnType<typeof createEligiblePicking>, 'exact'> & { exact: (index: number) => void },
    deselect: () => void,
  }

type FocusedAndSelectedBase = {
  focused: Ref<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createEligibleNavigation>,
  selected: Ref<Pickable<HTMLElement>>,
  is: {
    focused: (index: number) => boolean,
    selected: (index: number) => boolean,
    enabled: (index: number) => boolean,
    disabled: (index: number) => boolean,
  }
  getStatuses: (index: number) => ['focused' | 'blurred', 'selected' | 'deselected', 'enabled' | 'disabled'],
}

export type UseFocusedAndSelectedConfig<Multiselectable extends boolean = false> = Multiselectable extends true
  ? UseFocusedAndSelectedConfigBase<Multiselectable> & {
    initialSelected?: number | number[] | 'none',
  }
  : UseFocusedAndSelectedConfigBase<Multiselectable> & {
    initialSelected?: number | 'none',
  }

type UseFocusedAndSelectedConfigBase<Multiselectable extends boolean = false> = {
  elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
  ability: StatusOption<'enabled' | 'disabled'>,
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

export function useFocusedAndSelected<Multiselectable extends boolean = false> (
  {
    elementsApi,
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
  }: UseFocusedAndSelectedConfig<Multiselectable>
) {
  // ABILITY
  const getAbility = ensureGetStatus({ element: elementsApi.elements, status: ability })

  bind({
    element: elementsApi.elements,
    values: {
      ariaDisabled: {
        get: ({ index }) => getAbility(index) === 'disabled' ? true : undefined,
        watchSource: ensureWatchSourcesFromStatus(ability),
      },
    },
  })


  // FOCUSED
  const focused: FocusedAndSelected<true>['focused'] = useNavigateable(elementsApi.elements.value),
        focus: FocusedAndSelected<true>['focus'] = createEligibleNavigation({
          disabledElementsAreEligibleLocations: disabledElementsReceiveFocus,
          navigateable: focused,
          loops,
          ability,
          elementsApi,
        }),
        isFocused: FocusedAndSelected<true>['is']['focused'] = index => focused.value.location === index

  onMounted(() => {
    watchPostEffect(() => focused.value.array = elementsApi.elements.value)

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
    
    focused.value.navigate(initialFocused)

    if (transfersFocus) {
      watch(
        () => focused.value.location,
        () => {
          if (elementsApi.elements.value[focused.value.location]?.isSameNode(document.activeElement)) {
            return
          }
          
          elementsApi.elements.value[focused.value.location]?.focus()
        },
        { flush: 'post' }
      )
    }
  })

  if (transfersFocus){
    bind({
      element: elementsApi.elements,
      values: {
        tabindex: {
          get: ({ index }) => index === focused.value.location ? 0 : -1,
          watchSource: () => focused.value.location,
        },
      }
    })
  }


  // SELECTED
  const selected: FocusedAndSelected<true>['selected'] = usePickable(elementsApi.elements.value),
        select: FocusedAndSelected<true>['select'] = createEligiblePicking({
          pickable: selected,
          ability,
          elementsApi,
        }),
        deselect: FocusedAndSelected<true>['deselect'] = indexOrIndices => {
          if (!clearable) {
            if (
              new Pickable(elementsApi.elements.value)
                .pick(selected.value.picks)
                .omit(indexOrIndices)
                .picks.length === 0
            ) {
              return
            }
          }

          selected.value.omit(indexOrIndices)
        },
        isSelected: FocusedAndSelected<true>['is']['selected'] = index => selected.value.picks.includes(index)

  if (selectsOnFocus) {
    watch(
      () => focused.value.location,
      () => select.exact(focused.value.location, { replace: 'all' })
    )
  }

  onMounted(() => {
    watchPostEffect(() => selected.value.array = elementsApi.elements.value)
    selected.value.pick(initialSelected === 'none' ? [] : initialSelected)
  })

  bind({
    element: elementsApi.elements,
    values: {
      ariaSelected: {
        get: ({ index }) => isSelected(index) ? 'true' : undefined,
        watchSource: () => selected.value.picks,
      },
    }
  })


  // MULTIPLE CONCERNS
  const getStatuses: FocusedAndSelected<true>['getStatuses'] = index => {
    return [
      isFocused(index) ? 'focused' : 'blurred',
      isSelected(index) ? 'selected' : 'deselected',
      getAbility(index),
    ]
  }

  if (transfersFocus) {
    focusedAndSelectedOn({
      keyboardElement: elementsApi.elements,
      pointerElement: elementsApi.elements,
      getKeyboardIndex: createEffectIndex => createEffectIndex,
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
  } as FocusedAndSelected<Multiselectable>
}
