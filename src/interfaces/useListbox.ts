// TODO: optional aria-owns
import { computed, onMounted, watchPostEffect, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { bind, on } from '../affordances'
import {
  useHistory,
  useElementApi,
  preventEffect,
} from '../extracted'
import type {
  SingleElementApi,
  MultipleIdentifiedElementsApi,
  History,
  UseHistoryOptions,
} from '../extracted'

export type Listbox<Multiselectable extends boolean = false> = Multiselectable extends true
  ? ListboxBase & {
    activate: (...params: Parameters<Pickable<HTMLElement>['pick']>) => void,
    deactivate: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
    select: (...params: Parameters<Pickable<HTMLElement>['pick']>) => void,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : ListboxBase & {
    activate: (index: number) => void,
    deactivate: (index: number) => void,
    select: (index: number) => void,
    deselect: (index: number) => void,
  }

type ListboxBase = {
  root: SingleElementApi<HTMLElement>,
  options: MultipleIdentifiedElementsApi<HTMLElement>,
  active: Ref<Pickable<HTMLElement>>,
  selected: Ref<Pickable<HTMLElement>>,
  navigateable: Ref<Navigateable<HTMLElement>>,
  history: History<{ active: Parameters<Pickable<HTMLElement>['pick']>[0], selected: Parameters<Pickable<HTMLElement>['pick']>[0] }>,
  is: {
    active: (index: number) => boolean,
    selected: (index: number) => boolean,
  }
}

export type UseListboxOptions<Multiselectable extends boolean = false> = Multiselectable extends true
  ? UseListboxOptionsBase<Multiselectable> & {
    initialSelected?: number | number[],
    initialActive?: number | number[],
  }
  : UseListboxOptionsBase<Multiselectable> & {
    initialSelected?: number,
    initialActive?: number,
  }

type UseListboxOptionsBase<Multiselectable extends boolean> = {
  multiselectable?: Multiselectable,
  history?: UseHistoryOptions,
  orientation?: 'horizontal' | 'vertical',
  needsAriaOwns?: boolean,
  loops?: Parameters<Navigateable<HTMLElement>['next']>[0]['loops'],
}

const defaultOptions: UseListboxOptions<false> = {
  multiselectable: false,
  initialSelected: 0,
  initialActive: 0,
  orientation: 'vertical',
  needsAriaOwns: false,
  loops: false,
}

export function useListbox<Multiselectable extends boolean = false> (options: UseListboxOptions<Multiselectable> = {}): Listbox<Multiselectable> {
  // OPTIONS
  const {
    multiselectable,
    initialSelected,
    initialActive,
    history: historyOptions,
    orientation,
    needsAriaOwns,
    loops
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<Multiselectable>['root'] = useElementApi(),
        optionsApi: Listbox<Multiselectable>['options'] = useElementApi({ multiple: true, identified: true })


  // ACTIVE
  const active: ListboxBase['active'] = usePickable(optionsApi.elements.value, { initialPicks: initialActive }),
        activate: Listbox<true>['activate'] = (indexOrIndices, options = {}) => {
          if (multiselectable) {
            active.value.pick(indexOrIndices, options)
            return
          }
          
          active.value.pick(indexOrIndices, { ...options, replaces: true })
        },
        deactivate: Listbox<true>['deactivate'] = indexOrIndices => {
          active.value.omit(indexOrIndices)
        },
        navigateable: Listbox<true>['navigateable'] = useNavigateable(optionsApi.elements.value),
        isActive: Listbox<true>['is']['active'] = index => active.value.picks.includes(index)

  bind({
    element: root.element,
    values: {
      ariaActivedescendant: computed(() => optionsApi.ids.value[active.value.picks[active.value.picks.length - 1]] || preventEffect()),
    }
  })

  onMounted(() => {
    watchPostEffect(() => {
      active.value.setArray(optionsApi.elements.value)
      navigateable.value.setArray(optionsApi.elements.value)
    })
  })

  watch(
    () => navigateable.value.location,
    () => {
      if (active.value.multiple) {
        // do nothing
        return
      }

      history.record({
        active: navigateable.value.location,
        selected: selected.value.picks,
      })
    },
  )

  on<'focusin' | '+right' | 'shift+right' | '!shift+right' | '+left' | 'shift+left' | '!shift+left' | '+down' | 'shift+down' | '!shift+down' | '+up' | 'shift+up' | '!shift+up' | '+home' | '+end' | 'pointerup'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'focusin',
        () => {
          const lastSelected = selected.value.picks[selected.value.picks.length - 1] ?? 0
          activate(lastSelected)
        }
      ),
      ...(() => {
        if (orientation === 'horizontal' && multiselectable) {
          return [
            defineEffect(
              '!shift+right',
              event => {
                event.preventDefault()
                navigateable.value.next({ loops})
              }
            ),
            defineEffect(
              'shift+right',
              event => {
                event.preventDefault()
                const lastActive = active.value.picks[active.value.picks.length - 1]
                active.value.pick(lastActive + 1)
              }
            ),
            defineEffect(
              '!shift+left',
              event => {
                event.preventDefault()
                navigateable.value.navigate(active.value.picks[0] - 1)
              }
            ),
            defineEffect(
              'shift+left',
              event => {
                event.preventDefault()
                const firstActive = active.value.picks[0]
                active.value.pick(firstActive - 1)
              }
            ),
          ]
        }
        
        if (orientation === 'horizontal' && !multiselectable) {
          return [
            defineEffect(
              'right' as '+right',
              event => {
                event.preventDefault()
                navigateable.value.next({ loops})
              }
            ),
            defineEffect(
              'left' as '+left',
              event => {
                event.preventDefault()
                navigateable.value.previous({ loops })
              }
            ),
          ]
        }
        
        if (orientation === 'vertical' && multiselectable) {
          return [
            defineEffect(
              '!shift+down',
              event => {
                event.preventDefault()
                navigateable.value.next({ loops})
              }
            ),
            defineEffect(
              'shift+down',
              event => {
                event.preventDefault()
                const lastActive = active.value.picks[active.value.picks.length - 1]
                active.value.pick(lastActive + 1)
              }
            ),
            defineEffect(
              '!shift+up',
              event => {
                event.preventDefault()
                navigateable.value.navigate(active.value.picks[0] - 1)
              }
            ),
            defineEffect(
              'shift+up',
              event => {
                event.preventDefault()
                const firstActive = active.value.picks[0]
                active.value.pick(firstActive - 1)
              }
            ),
          ]
        }
        
        if (orientation === 'vertical' && !multiselectable) {
          return [
            defineEffect(
              'down' as '+down',
              event => {
                event.preventDefault()
                navigateable.value.next({ loops})
              }
            ),
            defineEffect(
              'up' as '+up',
              event => {
                event.preventDefault()
                navigateable.value.previous({ loops })
              }
            ),
          ]
        }
      })(),
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          navigateable.value.first()
        }
      ),
      defineEffect(
        'end' as '+end',
        event => {
          event.preventDefault()
          navigateable.value.last()
        }
      ),
    ]
  })

  on<'mouseup' | 'touchend'>({
    element: optionsApi.elements,
    effects: defineEffect => ['mouseup', 'touchend'].map(name => defineEffect(
      name as 'mouseup',
      {
        createEffect: ({ index }) => event => {
          event.preventDefault()
          navigateable.value.navigate(index)
        }
      }
    ))
  })
  
  
  // SELECTED
  const selected: ListboxBase['selected'] = usePickable(optionsApi.elements.value, { initialPicks: initialSelected }),
        select: Listbox<true>['select'] = (indexOrIndices, options = {}) => {
          if (multiselectable) {
            selected.value.pick(indexOrIndices, options)
            return
          }
          
          selected.value.pick(indexOrIndices, { ...options, replaces: true })
        },
        deselect: Listbox<true>['deselect'] = indexOrIndices => {
          selected.value.omit(indexOrIndices)
        },
        isSelected: Listbox<true>['is']['selected'] = index => selected.value.picks.includes(index)

  bind({
    element: optionsApi.elements,
    values: {
      ariaSelected: ({ index }) => `${selected.value.picks.includes(index)}`,
    }
  })

  onMounted(() => {
    watchPostEffect(() => selected.value.setArray(optionsApi.elements.value))
  })

  on<'+space' | '+enter'>({
    element: root.element,
    effects: defineEffect => ['space', 'enter'].map(name => defineEffect(
      name as '+enter',
      event => {
        event.preventDefault()

        const newSelected = []
        for (const pick of active.value.picks) {
          if (isSelected(pick)) {
            // do nothing
            continue
          }

          newSelected.push(pick)
        }

        select(newSelected, { replaces: true })
      }
    ))
  })

  on<'mouseup' | 'touchend' | '+space' | '+enter'>({
    element: optionsApi.elements,
    effects: defineEffect => ['mouseup', 'touchend'].map(name => defineEffect(
      name as 'mouseup',
      {
        createEffect: ({ index }) => event => {
          event.preventDefault()
          console.log('selected')
          if (isSelected(index)) {
            deselect(index)
            return
          }

          select(index)
        }
      }
    )),
  })


  // HISTORY
  const history: Listbox<true>['history'] = useHistory(historyOptions)

  watch(
    () => history.recorded.value.location,
    () => {
      const item = history.recorded.value.item
      active.value.pick(item.active, { replaces: true })
      selected.value.pick(item.selected, { replaces: true })
    },
  )

  history.record({
    active: active.value.picks,
    selected: selected.value.picks,
  })
  

  // WAI ARIA BASICS
  bind({
    element: root.element,
    values: {
      role: 'listbox',
      tabindex: 0,
      ariaMultiselectable: `${multiselectable}`,
      ariaOrientation: orientation,
      ariaOwns: computed(() => needsAriaOwns ? optionsApi.ids.value.join(' ') : preventEffect()),
    }
  })

  bind({
    element: optionsApi.elements,
    values: {
      role: 'option',
      id: ({ index }) => optionsApi.ids.value[index],
    }
  })


  // API
  return {
    root,
    options: {
      ...optionsApi,
      ids: optionsApi.ids
    },
    active,
    activate,
    deactivate,
    selected,
    select,
    deselect,
    is: {
      selected: isSelected,
      active: isActive,
    },
    history,
    navigateable,
  } as Listbox<Multiselectable>
}
