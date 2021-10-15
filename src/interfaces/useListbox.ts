// TODO: optional aria-owns
import { computed, onMounted, watchEffect, watchPostEffect, watch } from 'vue'
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
    activate: (indexOrIndices: number | number[]) => void,
    deactivate: (indexOrIndices?: number | number[]) => void,
    select: (indexOrIndices: number | number[]) => void,
    deselect: (indexOrIndices?: number | number[]) => void,
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
  domHierarchyRepresentsListboxOptionRelationship?: boolean,
}

const defaultOptions: UseListboxOptions<false> = {
  multiselectable: false,
  initialSelected: 0,
  initialActive: 0,
  orientation: 'vertical',
  domHierarchyRepresentsListboxOptionRelationship: true,
}

export function useListbox<Multiselectable extends boolean = false> (options: UseListboxOptions<Multiselectable> = {}): Listbox<Multiselectable> {
  // OPTIONS
  const {
    multiselectable,
    initialSelected,
    initialActive,
    history: historyOptions,
    orientation,
    domHierarchyRepresentsListboxOptionRelationship
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<Multiselectable>['root'] = useElementApi(),
        optionsApi: Listbox<Multiselectable>['options'] = useElementApi({ multiple: true, identified: true })


  // ACTIVE
  const active: ListboxBase['active'] = usePickable(optionsApi.elements.value, { initialPicks: initialActive }),
        activate: Listbox<true>['activate'] = indexOrIndices => {
          if (multiselectable) {
            active.value.pick(indexOrIndices)
            return
          }
          
          active.value.pick(indexOrIndices, { replaces: true })
        },
        deactivate: Listbox<true>['deactivate'] = indexOrIndices => {
          active.value.omit(indexOrIndices)
        },
        navigateable: Listbox<true>['navigateable'] = useNavigateable(optionsApi.elements.value)

  onMounted(() => {
    watchPostEffect(() => {
      console.log('watchPost')
      active.value.setArray(optionsApi.elements.value)
      navigateable.value.setArray(optionsApi.elements.value)
    })
  })

  watch(
    () => active.value.picks.join(''),
    () => {
      console.log(active.value.picks.join(''))
      const lastActive = active.value.picks[active.value.picks.length - 1]

      // Guard against already-focused tabs
      if (optionsApi.elements.value[lastActive].isSameNode(document.activeElement)) {
        return
      }
      
      optionsApi.elements.value[lastActive].focus()
    },
    { flush: 'post' }
  )

  watch(
    () => navigateable.value.location,
    () => {
      console.log('navigateable')
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

  on<'focusin' | '+right' | 'shift+right' | '!shift+right' | '+left' | 'shift+left' | '!shift+left' | '+down' | 'shift+down' | '!shift+down' | '+up' | 'shift+up' | '!shift+up' | '+home' | '+end'>({
    element: optionsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'focusin',
        {
          createEffect: ({ index }) => event => {
            const { relatedTarget } = event
            
            if (optionsApi.elements.value.some(element => element.isSameNode(relatedTarget as Node))) {
              active.value.pick(index, { replaces: multiselectable })
              return
            }

            event.preventDefault()
            
            const lastSelected = selected.value.picks[selected.value.picks.length - 1]
            if (lastSelected) {
              activate(lastSelected)
            }
          }
        }
      ),
      ...(() => {
        if (orientation === 'horizontal' && multiselectable) {
          return [
            defineEffect(
              '!shift+right',
              event => {
                event.preventDefault()
                navigateable.value.next()
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
                navigateable.value.next()
              }
            ),
            defineEffect(
              'left' as '+left',
              event => {
                event.preventDefault()
                navigateable.value.previous()
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
                navigateable.value.next()
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
                const newPick = active.value.picks.length === 0 ? 0 : active.value.picks[0] + 1
                active.value.pick(newPick, { replaces: true })
              }
            ),
            defineEffect(
              'up' as '+up',
              event => {
                event.preventDefault()
                const newPick = active.value.picks.length === 0 ? 0 : active.value.picks[0] - 1
                active.value.pick(newPick, { replaces: true })
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
  
  
  // SELECTED
  const selected: ListboxBase['selected'] = usePickable(optionsApi.elements.value, { initialPicks: initialSelected }),
        select: Listbox<true>['select'] = indexOrIndices => {
          if (multiselectable) {
            active.value.pick(indexOrIndices)
            return
          }
          
          active.value.pick(indexOrIndices, { replaces: true })
        },
        deselect: Listbox<true>['deselect'] = indexOrIndices => {
          active.value.omit(indexOrIndices)
        }

  onMounted(() => {
    watchPostEffect(() => selected.value.setArray(optionsApi.elements.value))
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
      ariaOwns: computed(() => domHierarchyRepresentsListboxOptionRelationship ? preventEffect() : optionsApi.ids.value.join(' ')),
      ariaActivedescendant: computed(() => optionsApi.ids.value[active.value[active.value.picks.length - 1]]),
    }
  })

  bind({
    element: optionsApi.elements,
    values: {
      role: 'option',
      tabindex: 0,
      id: ({ index }) => optionsApi.ids.value[index],
      ariaSelected: ({ index }) => `${selected.value.picks.includes(index)}`,
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
      selected: index => selected.value.picks.includes(index),
      active: index => active.value.picks.includes(index),
    },
    history,
    navigateable,
  } as Listbox<Multiselectable>
}
