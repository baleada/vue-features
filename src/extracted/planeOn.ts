import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { on } from '../affordances'
import type { Textbox } from '../interfaces'
import type { IdentifiedPlaneApi } from './useElementApi'
import { PlaneState, UsePlaneStateConfig } from './usePlaneState'
import type { GetStatus } from './ensureGetStatus'

export function planeOn<Multiselectable extends boolean = false> ({
  keyboardElement,
  pointerElement,
  getKeyboardRow,
  getKeyboardColumn,
  focusedRow,
  focusedColumn,
  selectedRows,
  selectedColumns,
  query,
  focus,
  select,
  deselect,
  isSelected,
  multiselectable,
  selectsOnFocus,
  clearable,
  popup,
  getAbility
}: {
  keyboardElement: Textbox['root']['element'] | IdentifiedPlaneApi<HTMLElement>['elements'],
  pointerElement: Textbox['root']['element'] | IdentifiedPlaneApi<HTMLElement>['elements'],
  getKeyboardRow: (createEffectRow: number) => number,
  getKeyboardColumn: (createEffectColumn: number) => number,
  focusedRow: PlaneState<Multiselectable>['focusedRow'],
  focusedColumn: PlaneState<Multiselectable>['focusedColumn'],
  selectedRows: PlaneState<Multiselectable>['selectedRows'],
  selectedColumns: PlaneState<Multiselectable>['selectedColumns'],
  query?: UsePlaneStateConfig<Multiselectable>['query'],
  focus: PlaneState<Multiselectable>['focus'],
  select: PlaneState<Multiselectable>['select'],
  deselect: PlaneState<Multiselectable>['deselect'],
  isSelected: PlaneState<Multiselectable>['is']['selected'],
  multiselectable: Multiselectable,
  selectsOnFocus: UsePlaneStateConfig<Multiselectable>['selectsOnFocus'],
  clearable: UsePlaneStateConfig<Multiselectable>['clearable'],
  popup: UsePlaneStateConfig<Multiselectable>['popup'],
  getAbility: GetStatus<IdentifiedPlaneApi<HTMLElement>['elements'], 'enabled' | 'disabled'>,
}) {
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
        multiselectable ? '!shift+!cmd+!ctrl+right' : '!cmd+!ctrl+right',
        {
          createEffect: (createEffectRow, createEffectColumn) => event => {
            event.preventDefault()

            const row = getKeyboardRow(createEffectRow),
                  column = getKeyboardColumn(createEffectColumn)

            const a = focus.nextInRow(row, column)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      defineEffect(
        multiselectable ? '!shift+!cmd+!ctrl+down' : '!cmd+!ctrl+down',
        {
          createEffect: (createEffectRow, createEffectColumn) => event => {
            event.preventDefault()

            const row = getKeyboardRow(createEffectRow),
                  column = getKeyboardColumn(createEffectColumn)

            const a = focus.nextInColumn(row, column)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      defineEffect(
        multiselectable ? '!shift+!cmd+!ctrl+left' : '!cmd+!ctrl+left',
        {
          createEffect: (createEffectRow, createEffectColumn) => event => {
            event.preventDefault()

            const row = getKeyboardRow(createEffectRow),
                  column = getKeyboardColumn(createEffectColumn)
            
            const a = focus.previousInRow(row, column)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      defineEffect(
        multiselectable ? '!shift+!cmd+!ctrl+up' : '!cmd+!ctrl+up',
        {
          createEffect: (createEffectRow, createEffectColumn) => event => {
            event.preventDefault()

            const row = getKeyboardRow(createEffectRow),
                  column = getKeyboardColumn(createEffectColumn)
            
            const a = focus.previousInColumn(row, column)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      ),
      defineEffect(
        'home' as '+home',
        event => {
          event.preventDefault()
          
          const a = focus.first()

          if (selectsOnFocus) {
            selectOnFocus(a)
          }
        }
      ),
      ...([
        multiselectable ? '!shift+ctrl+left' : 'ctrl+left',
        multiselectable ? '!shift+cmd+left' : 'cmd+left',
      ] as '!shift+cmd+left'[]).map(name => defineEffect(
        name,
        {
          createEffect: createEffectRow => event => {
            event.preventDefault()

            const row = getKeyboardRow(createEffectRow)
            
            const a = focus.firstInRow(row)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      )),
      ...([
        multiselectable ? '!shift+ctrl+up' : 'ctrl+up',
        multiselectable ? '!shift+cmd+up' : 'cmd+up',
      ] as '!shift+cmd+up'[]).map(name => defineEffect(
        name,
        {
          createEffect: (_, createEffectColumn) => event => {
            event.preventDefault()

            const column = getKeyboardColumn(createEffectColumn)
            
            const a = focus.firstInColumn(column)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      )),
      defineEffect(
        'end' as '+end',
        event => {
          event.preventDefault()
          
          const a = focus.last()

          if (selectsOnFocus) {
            selectOnFocus(a)
          }
        }
      ),
      ...([
        multiselectable ? '!shift+ctrl+right' : 'ctrl+right',
        multiselectable ? '!shift+cmd+right' : 'cmd+right',
      ] as '!shift+cmd+right'[]).map(name => defineEffect(
        name,
        {
          createEffect: createEffectRow => event => {
            event.preventDefault()

            const row = getKeyboardRow(createEffectRow)
            
            const a = focus.lastInRow(row)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      )),
      ...([
        multiselectable ? '!shift+ctrl+down' : 'ctrl+down',
        multiselectable ? '!shift+cmd+down' : 'cmd+down',
      ] as '!shift+cmd+down'[]).map(name => defineEffect(
        name,
        {
          createEffect: (_, createEffectColumn) => event => {
            event.preventDefault()

            const column = getKeyboardColumn(createEffectColumn)
            
            const a = focus.lastInColumn(column)

            if (selectsOnFocus) {
              selectOnFocus(a)
            }
          }
        }
      )),
      ...(() => {
        if (selectsOnFocus) return []

        return [
          defineEffect(
            'enter' as '+enter',
            {
              createEffect: (createEffectRow, createEffectColumn) => event => {
                event.preventDefault()

                const row = getKeyboardRow(createEffectRow),
                      column = getKeyboardColumn(createEffectColumn)

                if (isSelected(row, column)) {
                  if (clearable || selectedRows.value.picks.length > 1) {
                    deselect(row, column)
                  }
                  
                  return
                }
                
                if (multiselectable) {
                  (select.exact as PlaneState<true>['select']['exact'])(row, column, { replace: 'none' })
                } else {
                  select.exact(row, column)
                }
              }
            }
          ),
          defineEffect(
            'space' as '+space',
            {
              createEffect: (createEffectRow, createEffectColumn) => event => {
                if (query?.value) return

                event.preventDefault()

                const row = getKeyboardRow(createEffectRow),
                      column = getKeyboardColumn(createEffectColumn)

                if (isSelected(row, column)) {
                  if (clearable || selectedRows.value.picks.length > 1) {
                    deselect(row, column)
                  }
                  
                  return
                }
                
                if (multiselectable) {
                  (select.exact as PlaneState<true>['select']['exact'])(row, column, { replace: 'none' })
                } else {
                  select.exact(row, column)
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
                selectedRows.value.omit()
                selectedColumns.value.omit()
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
        {
          createEffect: (row, column) => event => {
            event.preventDefault()

            focus.exact(row, column)
            
            if (isSelected(row, column)) {
              if (clearable || selectedRows.value.picks.length > 1) {
                deselect(row, column)
              }
              
              return
            }
  
            if (multiselectable) {
              (select.exact as PlaneState<true>['select']['exact'])(row, column, { replace: 'none' })
            } else {
              select.exact(row, column)
            }
          },
        }
      ),
      defineEffect(
        'recognizeable' as TouchesTypes,
        {
          createEffect: (row, column) => event => {
            event.preventDefault()

            focus.exact(row, column)
            
            if (isSelected(row, column)) {
              if (clearable || selectedRows.value.picks.length > 1) {
                deselect(row, column)
              }
              
              return
            }
  
            if (multiselectable) {
              (select.exact as PlaneState<true>['select']['exact'])(row, column, { replace: 'none' })
            } else {
              select.exact(row, column)
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

  // TODO:
  // if (multiselectable) {
  //   on<
  //     typeof keyboardElement,
  //     'shift+!cmd+!ctrl+right'
  //     | 'shift+!cmd+!ctrl+left'
  //     | 'shift+ctrl+left'
  //     | 'shift+cmd+left'
  //     | 'shift+ctrl+right'
  //     | 'shift+cmd+right'
  //     | 'shift+!cmd+!ctrl+down'
  //     | 'shift+!cmd+!ctrl+up'
  //     | 'shift+ctrl+up'
  //     | 'shift+cmd+up'
  //     | 'shift+ctrl+down'
  //     | 'shift+cmd+down'
  //     | 'cmd+a'
  //     | 'ctrl+a'
  //   >(
  //     keyboardElement,
  //     defineEffect => [
  //       defineEffect(
  //         'shift+!cmd+!ctrl+right',
  //         {
  //           createEffect: (row, column) => event => {
  //             event.preventDefault()

  //             if (selectedRows.value.multiple && index === selected.value.first) {
  //               selected.value.omit(index)
  //               focus.next(index)
  //               return
  //             }
              
  //             if (selected.value.multiple && index !== selected.value.last) {
  //               selected.value.omit()
  //             }

  //             select.exact(row, column)
  //             const a = select.next(index)

  //             if (a === 'enabled') {
  //               focused.value.navigate(selected.value.newest)
  //             }
  //           }
  //         }
  //       ),
  //       defineEffect(
  //         'shift+!cmd+!ctrl+left',
  //         {
  //           createEffect: (row, column) => event => {
  //             event.preventDefault()

  //             if (selected.value.multiple && index === selected.value.last) {
  //               selected.value.omit(index)
  //               focus.previous(index)
  //               return
  //             }
              
  //             if (selected.value.multiple && index !== selected.value.first) {
  //               selected.value.omit()
  //             }

  //             select.exact(row, column)
  //             const a = select.previous(index)

  //             if (a === 'enabled') {
  //               focused.value.navigate(selected.value.newest)
  //             }
  //           }
  //         }
  //       ),
  //       defineEffect(
  //         'shift+cmd+right',
  //         {
  //           createEffect: (row, column) => event => {
  //             event.preventDefault()

  //             const picks: number[] = []
  //             for (let i = index; i < (keyboardElement as IdentifiedPlaneApi<HTMLElement>['elements']).value.length; i++) {
  //               if (getAbility(i) === 'enabled') {
  //                 picks.push(i)
  //               }
  //             }

  //             if (picks.length > 0) {
  //               focus.exact(picks[picks.length - 1])
  //               selected.value.pick(picks)
  //             } 
  //           }
  //         }
  //       ),
  //       defineEffect(
  //         'shift+cmd+left',
  //         {
  //           createEffect: (row, column) => event => {
  //             event.preventDefault()

  //             const picks: number[] = []
  //             for (let i = 0; i < index + 1; i++) {
  //               if (getAbility(i) === 'enabled') {
  //                 picks.push(i)
  //               }
  //             }

  //             if (picks.length > 0) {
  //               focus.exact(picks[0])
  //               selected.value.pick(picks)
  //             } 
  //           }
  //         }
  //       ),
  //       ...(['ctrl+a', 'cmd+a'] as 'cmd+a'[]).map(name => defineEffect(
  //         name,
  //         event => {
  //           event.preventDefault()

  //           const picks: number[] = []
  //           for (let i = 0; i < (keyboardElement as IdentifiedPlaneApi<HTMLElement>['elements']).value.length; i++) {
  //             if (getAbility(i) === 'enabled') {
  //               picks.push(i)
  //             }
  //           }

  //           if (picks.length > 0) {
  //             focus.last()
  //             selected.value.pick(picks, { replace: 'all' })
  //           }
  //         }
  //       )),
  //     ]
  //   )
  // }

  const selectOnFocus = (a: 'enabled' | 'disabled' | 'none') => {
    switch (a) {
      case 'enabled':
        selectedRows.value.pick(focusedRow.value.location, { replace: 'all' })
        selectedColumns.value.pick(focusedColumn.value.location, { replace: 'all' })
        break
      case 'disabled':
        selectedRows.value.omit()
        selectedColumns.value.omit()
        break
      case 'none':
        // do nothing
    }
  }
}
