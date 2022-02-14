import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { on } from '../affordances'
import type { Textbox } from '../interfaces'
import type { MultipleIdentifiedElementsApi } from './useElementApi'
import { FocusedAndSelected, UseFocusedAndSelectedConfig } from './useFocusedAndSelected'
import type { GetStatus } from './ensureGetStatus'

export function focusedAndSelectedOn<Multiselectable extends boolean = false> ({
  keyboardElement,
  pointerElement,
  getKeyboardIndex,
  focused,
  selected,
  query,
  focus,
  select,
  deselect,
  isSelected,
  orientation,
  multiselectable,
  selectsOnFocus,
  clearable,
  popup,
  getAbility
}: {
  keyboardElement: Textbox['root']['element'] | MultipleIdentifiedElementsApi<HTMLElement>['elements'],
  pointerElement: Textbox['root']['element'] | MultipleIdentifiedElementsApi<HTMLElement>['elements'],
  getKeyboardIndex: (createEffectIndex: number) => number,
  focused: FocusedAndSelected<Multiselectable>['focused'],
  selected: FocusedAndSelected<Multiselectable>['selected'],
  query?: UseFocusedAndSelectedConfig<Multiselectable>['query'],
  focus: FocusedAndSelected<Multiselectable>['focus'],
  select: FocusedAndSelected<Multiselectable>['select'],
  deselect: FocusedAndSelected<Multiselectable>['deselect'],
  isSelected: FocusedAndSelected<Multiselectable>['is']['selected'],
  multiselectable: Multiselectable,
  orientation: UseFocusedAndSelectedConfig<Multiselectable>['orientation'],
  selectsOnFocus: UseFocusedAndSelectedConfig<Multiselectable>['selectsOnFocus'],
  clearable: UseFocusedAndSelectedConfig<Multiselectable>['clearable'],
  popup: UseFocusedAndSelectedConfig<Multiselectable>['popup'],
  getAbility: GetStatus<'enabled' | 'disabled', MultipleIdentifiedElementsApi<HTMLElement>['elements']>,
}) {
  on<
    '!shift+!cmd+!ctrl+right'
    | '!cmd+!ctrl+right'
    | '!shift+!cmd+!ctrl+left'
    | '!cmd+!ctrl+left'
    | '!shift+ctrl+left'
    | 'ctrl+left'
    | '!shift+cmd+left'
    | 'cmd+left'
    | '!shift+ctrl+right'
    | 'ctrl+right'
    | '!shift+cmd+right'
    | 'cmd+right'
    | '!shift+!cmd+!ctrl+down'
    | '!cmd+!ctrl+down'
    | '!shift+!cmd+!ctrl+up'
    | '!cmd+!ctrl+up'
    | '!shift+ctrl+up'
    | 'ctrl+up'
    | '!shift+cmd+up'
    | 'cmd+up'
    | '!shift+ctrl+down'
    | 'ctrl+down'
    | '!shift+cmd+down'
    | 'cmd+down'
    | '+home'
    | '+end'
    | '+space'
    | '+enter'
    | '+esc'
    | 'keydown'
  >({
    element: keyboardElement,
    effects: defineEffect => [
      defineEffect(
        orientation === 'horizontal'
          ? multiselectable ? '!shift+!cmd+!ctrl+right' : '!cmd+!ctrl+right'
          : multiselectable ? '!shift+!cmd+!ctrl+down' : '!cmd+!ctrl+down',
        {
          createEffect: ({ index: createEffectIndex }) => event => {
            event.preventDefault()

            const index = getKeyboardIndex(createEffectIndex)

            const a = focus.next(index)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      defineEffect(
        orientation === 'horizontal'
          ? multiselectable ? '!shift+!cmd+!ctrl+left' : '!cmd+!ctrl+left'
          : multiselectable ? '!shift+!cmd+!ctrl+up' : '!cmd+!ctrl+up',
        {
          createEffect: ({ index: createEffectIndex }) => event => {
            event.preventDefault()

            const index = getKeyboardIndex(createEffectIndex)
            
            const a = focus.previous(index)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      ...([
        'home' as '+home',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+ctrl+left' : 'ctrl+left'
          : multiselectable ? '!shift+ctrl+up' : 'ctrl+up',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+cmd+left' : 'cmd+left'
          : multiselectable ? '!shift+cmd+up' : 'cmd+up',
      ] as '!shift+cmd+left'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          
          const a = focus.first()

          if (selectsOnFocus) {
            selectOnFocus(a)
          }
        }
      )),
      ...([
        'end' as '+end',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+ctrl+right' : 'ctrl+right'
          : multiselectable ? '!shift+ctrl+down' : 'ctrl+down',
        orientation === 'horizontal'
          ? multiselectable ? '!shift+cmd+right' : 'cmd+right'
          : multiselectable ? '!shift+cmd+down' : 'cmd+down',
      ] as '!shift+cmd+right'[]).map(name => defineEffect(
        name,
        event => {
          event.preventDefault()
          
          const a = focus.last()

          if (selectsOnFocus) {
            selectOnFocus(a)
          }
        }
      )),
      ...(() => {
        if (selectsOnFocus) return []

        return [
          defineEffect(
            'enter' as '+enter',
            {
              createEffect: ({ index: createEffectIndex }) => event => {
                event.preventDefault()

                const index = getKeyboardIndex(createEffectIndex)

                if (isSelected(index)) {
                  if (clearable || selected.value.picks.length > 1) {
                    deselect(index)
                  }
                  
                  return
                }
                
                if (multiselectable) {
                  (select.exact as FocusedAndSelected<true>['select']['exact'])(index, { replace: 'none' })
                } else {
                  select.exact(index)
                }
              }
            }
          ),
          defineEffect(
            'space' as '+space',
            {
              createEffect: ({ index: createEffectIndex }) => event => {
                event.preventDefault()

                const index = getKeyboardIndex(createEffectIndex)

                if (query?.value) return

                if (isSelected(index)) {
                  if (clearable || selected.value.picks.length > 1) {
                    deselect(index)
                  }
                  
                  return
                }
                
                if (multiselectable) {
                  (select.exact as FocusedAndSelected<true>['select']['exact'])(index, { replace: 'none' })
                } else {
                  select.exact(index)
                }
              }
            }
          ),
        ]
      })(),
      ...(() =>
        clearable && !popup
          ? [defineEffect(
              'esc' as '+esc',
              event => {
                event.preventDefault()
                selected.value.omit()
              }
            )]
          : []
      )()
    ],
  })

  on<
    'mousedown'
    | TouchesTypes,
    TouchesMetadata
  >({
    element: pointerElement,
    effects: defineEffect => [
      defineEffect(
        'mousedown',
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()

            focus.exact(index)
            
            if (isSelected(index)) {
              if (clearable || selected.value.picks.length > 1) {
                deselect(index)
              }
              
              return
            }
  
            if (multiselectable) {
              (select.exact as FocusedAndSelected<true>['select']['exact'])(index, { replace: 'none' })
            } else {
              select.exact(index)
            }
          },
        }
      ),
      defineEffect(
        'recognizeable' as TouchesTypes,
        {
          createEffect: ({ index }) => event => {
            event.preventDefault()

            focus.exact(index)
            
            if (isSelected(index)) {
              if (clearable || selected.value.picks.length > 1) {
                deselect(index)
              }
              
              return
            }
  
            if (multiselectable) {
              (select.exact as FocusedAndSelected<true>['select']['exact'])(index, { replace: 'none' })
            } else {
              select.exact(index)
            }
          },
          options: {
            listenable: {
              recognizeable: {
                effects: touches()
              }
            },
          }
        }
      ),
    ]
  })

  if (multiselectable) {
    on<
      'shift+!cmd+!ctrl+right'
      | 'shift+!cmd+!ctrl+left'
      | 'shift+ctrl+left'
      | 'shift+cmd+left'
      | 'shift+ctrl+right'
      | 'shift+cmd+right'
      | 'shift+!cmd+!ctrl+down'
      | 'shift+!cmd+!ctrl+up'
      | 'shift+ctrl+up'
      | 'shift+cmd+up'
      | 'shift+ctrl+down'
      | 'shift+cmd+down'
      | 'cmd+a'
      | 'ctrl+a'
    >({
      element: keyboardElement,
      effects: defineEffect => [
        defineEffect(
          orientation === 'horizontal' ? 'shift+!cmd+!ctrl+right' : 'shift+!cmd+!ctrl+down',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              if (selected.value.multiple && index === selected.value.first) {
                selected.value.omit(index)
                focus.next(index)
                return
              }
              
              if (selected.value.multiple && index !== selected.value.last) {
                selected.value.omit()
              }

              select.exact(index)
              const a = select.next(index)

              if (a === 'enabled') {
                focused.value.navigate(selected.value.newest)
              }
            }
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+!cmd+!ctrl+left' : 'shift+!cmd+!ctrl+up',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              if (selected.value.multiple && index === selected.value.last) {
                selected.value.omit(index)
                focus.previous(index)
                return
              }
              
              if (selected.value.multiple && index !== selected.value.first) {
                selected.value.omit()
              }

              select.exact(index)
              const a = select.previous(index)

              if (a === 'enabled') {
                focused.value.navigate(selected.value.newest)
              }
            }
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+cmd+right' : 'shift+cmd+down',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              const picks: number[] = []
              for (let i = index; i < (keyboardElement as MultipleIdentifiedElementsApi<HTMLElement>['elements']).value.length; i++) {
                if (getAbility(i) === 'enabled') {
                  picks.push(i)
                }
              }

              if (picks.length > 0) {
                focus.exact(picks[picks.length - 1])
                selected.value.pick(picks)
              } 
            }
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+cmd+left' : 'shift+cmd+up',
          {
            createEffect: ({ index }) => event => {
              event.preventDefault()

              const picks: number[] = []
              for (let i = 0; i < index + 1; i++) {
                if (getAbility(i) === 'enabled') {
                  picks.push(i)
                }
              }

              if (picks.length > 0) {
                focus.exact(picks[0])
                selected.value.pick(picks)
              } 
            }
          }
        ),
        ...(['ctrl+a', 'cmd+a'] as 'cmd+a'[]).map(name => defineEffect(
          name,
          event => {
            event.preventDefault()

            const picks: number[] = []
            for (let i = 0; i < (keyboardElement as MultipleIdentifiedElementsApi<HTMLElement>['elements']).value.length; i++) {
              if (getAbility(i) === 'enabled') {
                picks.push(i)
              }
            }

            if (picks.length > 0) {
              focus.last()
              selected.value.pick(picks, { replace: 'all' })
            }
          }
        )),
      ]
    })
  }

  const selectOnFocus = (a: 'enabled' | 'disabled' | 'none') => {
    switch (a) {
      case 'enabled':
        selected.value.pick(focused.value.location, { replace: 'all' })
        break
      case 'disabled':
        selected.value.omit()
        break
      case 'none':
        // do nothing
    }
  }
}
