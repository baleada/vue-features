import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { on } from '../affordances'
import type { IdentifiedElementApi, IdentifiedListApi } from './useElementApi'
import { ListState, UseListStateConfig } from './useListState'
import type { GetStatus } from './ensureGetStatus'

export function listOn<Multiselectable extends boolean = false> ({
  keyboardElement,
  pointerElement,
  getIndex,
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
  keyboardElement: IdentifiedElementApi<HTMLElement>['element'],
  pointerElement: IdentifiedElementApi<HTMLElement>['element'],
  getIndex: (id: string) => number,
  focused: ListState<Multiselectable>['focused'],
  selected: ListState<Multiselectable>['selected'],
  query?: UseListStateConfig<Multiselectable>['query'],
  focus: ListState<Multiselectable>['focus'],
  select: ListState<Multiselectable>['select'],
  deselect: ListState<Multiselectable>['deselect'],
  isSelected: ListState<Multiselectable>['is']['selected'],
  multiselectable: Multiselectable,
  orientation: UseListStateConfig<Multiselectable>['orientation'],
  selectsOnFocus: UseListStateConfig<Multiselectable>['selectsOnFocus'],
  clearable: UseListStateConfig<Multiselectable>['clearable'],
  popup: UseListStateConfig<Multiselectable>['popup'],
  getAbility: GetStatus<IdentifiedListApi<HTMLElement>['elements'], 'enabled' | 'disabled'>,
}) {
  // TODO:
  // shift+click
  // drag
  on<
    typeof keyboardElement,
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
  >(
    keyboardElement,
    defineEffect => [
      defineEffect(
        orientation === 'horizontal'
          ? multiselectable ? '!shift+!cmd+!ctrl+right' : '!cmd+!ctrl+right'
          : multiselectable ? '!shift+!cmd+!ctrl+down' : '!cmd+!ctrl+down',
          event => {
            event.preventDefault()

            const index = getIndex((event.target as HTMLElement).id)

            const a = focus.next(index)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
      ),
      defineEffect(
        orientation === 'horizontal'
          ? multiselectable ? '!shift+!cmd+!ctrl+left' : '!cmd+!ctrl+left'
          : multiselectable ? '!shift+!cmd+!ctrl+up' : '!cmd+!ctrl+up',
        event => {
          event.preventDefault()

          const index = getIndex((event.target as HTMLElement).id)
          
          const a = focus.previous(index)

          if (selectsOnFocus) {
            selectOnFocus(a)
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

          if (selectsOnFocus) selectOnFocus(a)
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

          if (selectsOnFocus) selectOnFocus(a)
        }
      )),
      ...(() => {
        if (selectsOnFocus) return []

        return [
          defineEffect(
            'enter' as '+enter',
            event => {
              event.preventDefault()

              const index = getIndex((event.target as HTMLElement).id)

              if (isSelected(index)) {
                if (clearable || selected.value.picks.length > 1) deselect(index)
                return
              }
              
              if (multiselectable) {
                (select.exact as ListState<true>['select']['exact'])(index, { replace: 'none' })
              } else {
                select.exact(index)
              }
            }
          ),
          defineEffect(
            'space' as '+space',
            event => {
              if (query?.value) return

              event.preventDefault()

              const index = getIndex((event.target as HTMLElement).id)

              if (isSelected(index)) {
                if (clearable || selected.value.picks.length > 1) deselect(index)                
                return
              }
              
              if (multiselectable) {
                (select.exact as ListState<true>['select']['exact'])(index, { replace: 'none' })
              } else {
                select.exact(index)
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
                // TODO: if cleraable, deselect all, otherwise deselect all except current
              }
            )]
          : []
      )()
    ],
  )

  on<
    typeof pointerElement,
    'mousedown'
    | TouchesTypes,
    TouchesMetadata
  >(
    pointerElement,
    defineEffect => [
      defineEffect(
        'mousedown',
        event => {
          event.preventDefault()

          const index = getIndex((event.target as HTMLElement).id)
          if (index === -1) return

          focus.exact(index)
          
          if (isSelected(index)) {
            if (clearable || selected.value.picks.length > 1) deselect(index)
            return
          }

          if (multiselectable) {
            (select.exact as ListState<true>['select']['exact'])(index, { replace: 'none' })
          } else {
            select.exact(index)
          }
        }
      ),
      defineEffect(
        'recognizeable' as TouchesTypes,
        {
          createEffect: () => event => {
            event.preventDefault()

            const index = getIndex((event.target as HTMLElement).id)
            if (index === -1) return

            focus.exact(index)
            
            if (isSelected(index)) {
              if (clearable || selected.value.picks.length > 1) deselect(index)              
              return
            }
  
            if (multiselectable) {
              (select.exact as ListState<true>['select']['exact'])(index, { replace: 'none' })
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
  )

  if (multiselectable) {
    on<
      typeof keyboardElement,
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
    >(
      keyboardElement,
      defineEffect => [
        defineEffect(
          orientation === 'horizontal' ? 'shift+!cmd+!ctrl+right' : 'shift+!cmd+!ctrl+down',
          event => {
            event.preventDefault()

            const index = getIndex((event.target as HTMLElement).id)

            if (selected.value.multiple && index === selected.value.first) {
              selected.value.omit(index)
              focus.next(index)
              return
            }
            
            if (selected.value.multiple && index !== selected.value.last) selected.value.omit()

            select.exact(index)
            const a = select.next(index)

            if (a === 'enabled') focused.value.navigate(selected.value.newest)
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+!cmd+!ctrl+left' : 'shift+!cmd+!ctrl+up',
          event => {
            event.preventDefault()

            const index = getIndex((event.target as HTMLElement).id)

            if (selected.value.multiple && index === selected.value.last) {
              selected.value.omit(index)
              focus.previous(index)
              return
            }
            
            if (selected.value.multiple && index !== selected.value.first) selected.value.omit()

            select.exact(index)
            const a = select.previous(index)

            if (a === 'enabled') focused.value.navigate(selected.value.newest)
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+cmd+right' : 'shift+cmd+down',
          event => {
            event.preventDefault()

            const index = getIndex((event.target as HTMLElement).id)

            const picks: number[] = []
            for (let i = index; i < selected.value.array.length; i++) {
              if (getAbility(i) === 'enabled') {
                picks.push(i)
              }
            }

            if (picks.length > 0) {
              focus.exact(picks[picks.length - 1])
              selected.value.pick(picks)
            } 
          }
        ),
        defineEffect(
          orientation === 'horizontal' ? 'shift+cmd+left' : 'shift+cmd+up',
          event => {
            event.preventDefault()

            const index = getIndex((event.target as HTMLElement).id)

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
        ),
        ...(['ctrl+a', 'cmd+a'] as 'cmd+a'[]).map(name => defineEffect(
          name,
          event => {
            event.preventDefault()

            const picks: number[] = []
            for (let i = 0; i < selected.value.array.length; i++) {
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
    )
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
