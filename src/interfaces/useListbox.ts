import { computed, onMounted, watchPostEffect, watch } from 'vue'
import type { Ref } from 'vue'
import type { Navigateable, Pickable } from '@baleada/logic'
import type { MatchData } from 'fast-fuzzy'
import { useNavigateable, usePickable } from '@baleada/vue-composition'
import { bind, on } from '../affordances'
import type { BindValueGetterWithWatchSources } from '../affordances'
import {
  useHistory,
  useElementApi,
  ensureGetStatus,
  createPossibleNavigation,
  createPossiblePicking,
  ensureWatchSourcesFromStatus,
  useQuery,
} from '../extracted'
import type {
  SingleElementApi,
  MultipleIdentifiedElementsApi,
  History,
  UseHistoryOptions,
  BindValue,
  ToPossibility,
} from '../extracted'


export type Listbox<Multiselectable extends boolean = false> = Multiselectable extends true
  ? ListboxBase & {
    active: Ref<number[]>,
    activate: ReturnType<typeof createPossiblePicking>,
    deactivate: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
    selected: Ref<number[]>,
    select: ReturnType<typeof createPossiblePicking>,
    deselect: (...params: Parameters<Pickable<HTMLElement>['omit']>) => void,
  }
  : ListboxBase & {
    active: Ref<number>,
    activate: Omit<ReturnType<typeof createPossiblePicking>, 'exact'> & { exact: (index: number) => void },
    deactivate: (index: number) => void,
    selected: Ref<number>,
    select: Omit<ReturnType<typeof createPossiblePicking>, 'exact'> & { exact: (index: number) => void },
    deselect: (index: number) => void,
  }

type ListboxBase = {
  root: SingleElementApi<HTMLElement>,
  options: MultipleIdentifiedElementsApi<HTMLElement>,
  focused: Ref<Navigateable<HTMLElement>>,
  focus: ReturnType<typeof createPossibleNavigation>,
  query: Ref<string>,
  type: (character: string) => void,
  history: History<{
    focused: Navigateable<HTMLElement>['location'],
    active: Pickable<HTMLElement>['picks'],
    selected: Pickable<HTMLElement>['picks'],
  }>,
  is: {
    focused: (index: number) => boolean,
    active: (index: number) => boolean,
    selected: (index: number) => boolean,
  }
  getStatuses: (index: number) => ['enabled' | 'disabled', 'focused' | 'blurred', 'active' | 'inactive', 'selected' | 'deselected'],
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
  ability?: BindValue<'enabled' | 'disabled'> | BindValueGetterWithWatchSources<'enabled' | 'disabled'>,
  disabledOptionsReceiveFocus?: boolean,
  queryMatchThreshold?: number,
  toCandidate?: ({ element: HTMLElement, index: number }) => string,
}

const defaultOptions: UseListboxOptions<false> = {
  multiselectable: false,
  initialSelected: 0,
  initialActive: 0,
  orientation: 'vertical',
  needsAriaOwns: false,
  loops: false,
  ability: 'enabled',
  disabledOptionsReceiveFocus: true,
  queryMatchThreshold: 1,
  toCandidate: ({ element }) => element.textContent,
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
    loops,
    ability: abilityOption,
    disabledOptionsReceiveFocus,
    queryMatchThreshold,
    toCandidate,
  } = ({ ...defaultOptions, ...options } as UseListboxOptions<Multiselectable>)

  
  // ELEMENTS
  const root: Listbox<Multiselectable>['root'] = useElementApi(),
        optionsApi: Listbox<Multiselectable>['options'] = useElementApi({ multiple: true, identified: true })


  // UTILS
  const getAbility = ensureGetStatus({ element: optionsApi.elements, status: abilityOption })


  // QUERY
  const { query, searchable, type, search } = useQuery({ elementsApi: optionsApi, toCandidate })

  on<'keydown'>({
    element: optionsApi.elements,
    effects: defineEffect => [
      defineEffect(
        'keydown',
        event => {
          if (
            (event.key.length === 1 || !/^[A-Z]/i.test(event.key))
            && !event.ctrlKey && !event.metaKey
          ) {
            event.preventDefault()
            type(event.key)
            search()
          }
        }
      )
    ]
  })


  // FOCUSED
  const focused: Listbox<true>['focused'] = useNavigateable(optionsApi.elements.value),
        focus: Listbox<true>['focus'] = createPossibleNavigation({
          disabledElementsArePossibleLocations: disabledOptionsReceiveFocus,
          navigateable: focused,
          loops,
          ability: abilityOption,
          elementsApi: optionsApi,
          getAbility,
        })

  watch(
    () => searchable.value.results,
    () => {
      const toPossibility: ToPossibility = ({ index }) => {
              return (searchable.value.results[index] as MatchData<string>).score >= queryMatchThreshold ? 'possible' : 'impossible'
            }
      
      const ability = focus.next(focused.value.location, { toPossibility })
      if (ability === 'none' && !loops) {
        focus.first({ toPossibility })
      }
    }
  )

  onMounted(() => {
    watchPostEffect(() => focused.value.array = optionsApi.elements.value)

    watch(
      () => focused.value.location,
      () => {
        if (optionsApi.elements.value[focused.value.location].isSameNode(document.activeElement)) {
          return
        }
        
        optionsApi.elements.value[focused.value.location].focus()
      },
      { flush: 'post' }
    )
  })

  bind({
    element: root.element,
    values: { tabindex: -1 },
  })

  bind({
    element: optionsApi.elements,
    values: {
      tabindex: {
        get: ({ index }) => index === focused.value.location ? 0 : -1,
        watchSources: [
          () => focused.value.location,
          ...ensureWatchSourcesFromStatus(abilityOption),
        ],
      },
    }
  })


  // ACTIVE
  const active = usePickable(optionsApi.elements.value),
        activate = createPossiblePicking({
          pickable: active,
          ability: abilityOption,
          elementsApi: optionsApi,
          getAbility,
        }),
        deactivate: Listbox<true>['deactivate'] = indexOrIndices => {
          active.value.omit(indexOrIndices)
        },
        isActive: Listbox<true>['is']['active'] = index => active.value.picks.includes(index)

  bind({
    element: root.element,
    values: {
      ariaActivedescendant: computed(() => optionsApi.ids.value[active.value.picks[active.value.picks.length - 1]] || undefined),
    }
  })

  onMounted(() => {
    watchPostEffect(() => active.value.array = optionsApi.elements.value)
    active.value.pick(initialActive)
  })
  
  
  // SELECTED
  const selected = usePickable(optionsApi.elements.value),
        select = createPossiblePicking({
          pickable: selected,
          ability: abilityOption,
          elementsApi: optionsApi,
          getAbility,
        }),
        deselect: Listbox<true>['deselect'] = indexOrIndices => {
          selected.value.omit(indexOrIndices)
        },
        isSelected: Listbox<true>['is']['selected'] = index => selected.value.picks.includes(index)

  bind({
    element: optionsApi.elements,
    values: {
      ariaSelected: ({ index }) => `${isSelected(index)}`,
    }
  })

  onMounted(() => {
    watchPostEffect(() => selected.value.array = optionsApi.elements.value)
    selected.value.pick(initialSelected)
  })

  on<'+space' | '+enter'>({
    element: optionsApi.elements,
    effects: defineEffect => ['space', 'enter'].map(name => defineEffect(
      name as '+enter',
      (() => {
        if (multiselectable) {
          return event => {
            event.preventDefault()

            if (active.value.picks.every(pick => selected.value.picks.includes(pick))) {
              deselect(active.value.picks)
              return
            }

            select.exact(active.value.picks)
          }
        }

        return event => {
          event.preventDefault()
          select.exact(active.value.picks, { replace: 'all' })
        }
      })(),
    ))
  })


  // HISTORY
  const history: Listbox<true>['history'] = useHistory(historyOptions)

  watch(
    () => history.recorded.value.location,
    () => {
      const item = history.recorded.value.item
      focused.value.navigate(item.focused)
      active.value.pick(item.active, { replace: 'all' })
      selected.value.pick(item.selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.value.location,
    active: active.value.picks,
    selected: selected.value.picks,
  })


  // MULTIPLE CONCERNS
  on<'+right' | 'shift+right' | '!shift+right' | '+left' | 'shift+left' | '!shift+left' | '+down' | 'shift+down' | '!shift+down' | '+up' | 'shift+up' | '!shift+up' | '+home' | '+end' | 'mouseup' | 'touchend' | 'mouseenter'>({
    element: optionsApi.elements,
    effects: defineEffect => [
      ...(() => {
        if (multiselectable) {
          return [
            defineEffect(
              orientation === 'horizontal' ? '!shift+right' : '!shift+down',
              event => {
                event.preventDefault()

                if (active.value.last === optionsApi.elements.value.length - 1) {
                  focused.value.navigate(active.value.last)
                  active.value.pick(active.value.last, { replace: 'all' })
                  return
                }

                const a = focus.next(active.value.last)

                switch (a) {
                  case 'enabled':
                    active.value.pick(focused.value.location, { replace: 'all' })
                    break
                  case 'disabled':
                    active.value.omit()
                    break
                  case 'none':
                    // do nothing
                }
              }
            ),
            defineEffect(
              orientation === 'horizontal' ? 'shift+right' : 'shift+down',
              {
                createEffect: ({ index }) => event => {
                  event.preventDefault()

                  if (active.value.picks.length === 0) {
                    const a = activate.next(focused.value.location)

                    if (a === 'enabled') {
                      focused.value.navigate(active.value.newest)
                    }

                    return
                  }

                  if (active.value.picks.length > 1 && index === active.value.first) {
                    active.value.pick(active.value.picks.slice(0, active.value.picks.length - 1), { replace: 'all' })
                    focused.value.navigate(active.value.newest)

                    return
                  }

                  const a = activate.next(active.value.last)

                  if (a === 'enabled') {
                    focused.value.navigate(active.value.newest)
                  }
                }
              }
            ),
            defineEffect(
              orientation === 'horizontal' ? '!shift+left' : '!shift+up',
              event => {
                event.preventDefault()

                if (active.value.first === 0) {
                  focused.value.navigate(active.value.first)
                  active.value.pick(active.value.first, { replace: 'all' })
                  return
                }

                const a = focus.previous(active.value.first)

                switch (a) {
                  case 'enabled':
                    active.value.pick(focused.value.location, { replace: 'all' })
                    break
                  case 'disabled':
                    active.value.omit()
                    break
                  case 'none':
                    // do nothing
                }
              }
            ),
            defineEffect(
              orientation === 'horizontal' ? 'shift+left' : 'shift+up',
              {
                createEffect: ({ index }) => event => {
                  event.preventDefault()
  
                  if (active.value.picks.length === 0) {
                    const a = activate.previous(focused.value.location)
  
                    if (a === 'enabled') {
                      focused.value.navigate(active.value.newest)
                    }
  
                    return
                  }
  
                  if (active.value.picks.length > 1 && index === active.value.last) {
                    active.value.pick(active.value.picks.slice(0, active.value.picks.length - 1), { replace: 'all' })
                    focused.value.navigate(active.value.newest)

                    return
                  }
  
                  const a = activate.previous(active.value.first)
  
                  if (a === 'enabled') {
                    focused.value.navigate(active.value.newest)
                  }
                }
              }
            ),
          ]
        }
        
        return [
          defineEffect(
            orientation === 'horizontal' ? 'right' as '+right' : 'down' as '+down',
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()

                const a = focus.next(index)

                switch (a) {
                  case 'enabled':
                    active.value.pick(focused.value.location, { replace: 'all' })
                    break
                  case 'disabled':
                    active.value.omit()
                    break
                  case 'none':
                    // do nothing
                }
              }
            }
          ),
          defineEffect(
            orientation === 'horizontal' ? 'left' as '+left' : 'up' as '+up',
            {
              createEffect: ({ index }) => event => {
                event.preventDefault()
                const a = focus.previous(index)

                switch (a) {
                  case 'enabled':
                    active.value.pick(focused.value.location, { replace: 'all' })
                    break
                  case 'disabled':
                    active.value.omit()
                    break
                  case 'none':
                    // do nothing
                }
              }
            }
          ),
        ]
      })(),
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          focus.first()
        }
      ),
      defineEffect(
        'end' as '+end',
        event => {
          event.preventDefault()
          focus.last()
        }
      ),
      ...['mouseup', 'touchend'].map(name => defineEffect(
        name as 'mouseup',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()
  
            focus.exact(index)
            activate.exact(index, { replace: 'all' })
            
            if (isSelected(index)) {
              deselect(index)
              return
            }
  
            select.exact(index, { replace: multiselectable ? 'none' : 'all' })
          }
        }
      )),
      defineEffect(
        'mouseenter',
        {
          createEffect: ({ index }) => () => {
            if (multiselectable || active.value.picks.length > 1) {
              return
            }

            activate.exact(index, { replace: 'all' })
          }
        }
      )
    ]
  })
  

  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      role: 'listbox',
      ariaMultiselectable: () => multiselectable || undefined,
      ariaOrientation: orientation,
      ariaOwns: (() => {
        if (needsAriaOwns) {
          return computed(() => optionsApi.ids.value.join(' '))
        }
      })()
    }
  })

  bind({
    element: optionsApi.elements,
    values: {
      role: 'option',
      id: ({ index }) => optionsApi.ids.value[index],
      ariaDisabled: {
        get: ({ index }) => getAbility(index) === 'disabled' ? true : undefined,
        watchSources: ensureWatchSourcesFromStatus(abilityOption),
      },
    }
  })


  // API
  return {
    root,
    options: optionsApi,
    active: computed(() => multiselectable ? active.value.picks : active.value.picks[0]),
    activate: {
      ...activate,
      exact: multiselectable ? activate.exact : index => activate.exact(index, { replace: 'all' })
    },
    deactivate,
    selected: computed(() => multiselectable ? selected.value.picks : selected.value.picks[0]),
    select: {
      ...select,
      exact: multiselectable ? select.exact : index => select.exact(index, { replace: 'all' })
    },
    deselect,
    is: {
      selected: isSelected,
      active: isActive,
    },
    history,
    focused,
    focus,
    query: computed(() => query.value),
    type,
  } as unknown as Listbox<Multiselectable>
}
