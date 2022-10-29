import { mousedrag, touchdrag, touches } from '@baleada/recognizeable-effects'
import type {
  MousedragTypes, MousedragMetadata,
  TouchdragTypes, TouchdragMetadata,
  TouchesTypes, TouchesMetadata
} from '@baleada/recognizeable-effects'
import { on, defineRecognizeableEffect } from '../affordances'
import type { IdentifiedElementApi } from './useElementApi'
import { PlaneState, UsePlaneStateConfig } from './usePlaneState'

export function planeOn<Multiselectable extends boolean = false> ({
  keyboardElement,
  pointerElement,
  getRow,
  getColumn,
  focusedRow,
  focusedColumn,
  selectedRows,
  selectedColumns,
  query,
  focus,
  select,
  deselect,
  isSelected,
  preventSelectOnFocus,
  allowSelectOnFocus,
  multiselectable,
  selectsOnFocus,
  clearable,
  popup,
  getAbility,
}: {
  keyboardElement: IdentifiedElementApi<HTMLElement>['element'],
  pointerElement: IdentifiedElementApi<HTMLElement>['element'],
  getRow: (id: string) => number,
  getColumn: (id: string, row: number) => number,
  focusedRow: PlaneState<Multiselectable>['focusedRow'],
  focusedColumn: PlaneState<Multiselectable>['focusedColumn'],
  selectedRows: PlaneState<Multiselectable>['selectedRows'],
  selectedColumns: PlaneState<Multiselectable>['selectedColumns'],
  query?: UsePlaneStateConfig<Multiselectable>['query'],
  focus: PlaneState<Multiselectable>['focus'],
  select: PlaneState<Multiselectable>['select'],
  deselect: PlaneState<Multiselectable>['deselect'],
  isSelected: PlaneState<Multiselectable>['is']['selected'],
  preventSelectOnFocus: () => void,
  allowSelectOnFocus: () => void,
  multiselectable: Multiselectable,
  selectsOnFocus: UsePlaneStateConfig<Multiselectable>['selectsOnFocus'],
  clearable: UsePlaneStateConfig<Multiselectable>['clearable'],
  popup: UsePlaneStateConfig<Multiselectable>['popup'],
  getAbility: (row: number, column: number) => 'enabled' | 'disabled',
}) {
  on(
    keyboardElement,
    {
      keydown: (event, { is }) => {
        if (multiselectable) {
          if (is('shift+cmd+up') || is('shift+ctrl+up')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = row; r >= 0; r--) {
              for (let c = selectedColumns.value.last; c >= selectedColumns.value.first; c--) {
                if (getAbility(r, c) === 'enabled') {
                  newRows.unshift(r)
                  newColumns.unshift(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact(newRows[0], column)
              selectedRows.value.pick(newRows, { allowsDuplicates: true })
              selectedColumns.value.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (is('shift+cmd+right') || is('shift+ctrl+right')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = selectedRows.value.first; r <= selectedRows.value.last; r++) {
              for (let c = column; c < selectedColumns.value.array.length; c++) {
                if (getAbility(r, c) === 'enabled') {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact(row, newColumns[newColumns.length - 1])
              selectedRows.value.pick(newRows, { allowsDuplicates: true })
              selectedColumns.value.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (is('shift+cmd+down') || is('shift+ctrl+down')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = row; r < selectedRows.value.array.length; r++) {
              for (let c = selectedColumns.value.first; c <= selectedColumns.value.last; c++) {
                if (getAbility(r, c) === 'enabled') {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact(newRows[newRows.length - 1], column)
              selectedRows.value.pick(newRows, { allowsDuplicates: true })
              selectedColumns.value.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (is('shift+cmd+left') || is('shift+ctrl+left')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = selectedRows.value.last; r >= selectedRows.value.first; r--) {
              for (let c = column; c >= 0; c--) {
                if (getAbility(r, c) === 'enabled') {
                  newRows.unshift(r)
                  newColumns.unshift(c)
                }
              }
            }


            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact(row, newColumns[0])
              selectedRows.value.pick(newRows, { allowsDuplicates: true })
              selectedColumns.value.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (is('shift+up')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedRows.value.multiple && row === selectedRows.value.last) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
                if (selectedRows.value.picks[rowPick] === row) {
                  omits.push(rowPick)
                }
              }

              selectedRows.value.omit(omits, { reference: 'picks' })
              selectedColumns.value.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.previousInColumn(row, column)
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedRows.value.multiple && row !== selectedRows.value.first) {
              selectedRows.value.omit()
              selectedColumns.value.omit()
            }

            const newRows: number[] = [],
                  newColumns: number[] = [],
                  oldFirstRow = selectedRows.value.first

            for (let r = selectedRows.value.first; r <= selectedRows.value.last; r++) {
              for (let c = selectedColumns.value.first; c <= selectedColumns.value.last; c++) {
                // Ability check handled by select.exact
                newRows.push(r)
                newColumns.push(c)
              }
            }

            select.exact(row, column)
            const a = select.previousInColumn(row, column)

            if (a === 'enabled') {
              const newFirstRow = selectedRows.value.first

              for (let r = oldFirstRow - 1; r >= newFirstRow; r--) {
                for (let c = selectedColumns.value.last; c >= selectedColumns.value.first; c--) {
                  // Ability check handled by select.exact
                  newRows.unshift(r)
                  newColumns.unshift(c)
                }
              }

              (select.exact as PlaneState<true>['select']['exact'])(newRows, newColumns, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.value.navigate(selectedRows.value.first)
              focusedColumn.value.navigate(column)
              allowSelectOnFocus()
            }

            return
          }

          if (is('shift+right')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedColumns.value.multiple && column === selectedColumns.value.first) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
                if (selectedColumns.value.picks[rowPick] === column) {
                  omits.push(rowPick)
                }
              }
              
              selectedRows.value.omit(omits, { reference: 'picks' })
              selectedColumns.value.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.nextInRow(row, column)
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedColumns.value.multiple && column !== selectedColumns.value.last) {
              selectedRows.value.omit()
              selectedColumns.value.omit()
            }

            const newRows: number[] = [],
                  newColumns: number[] = [],
                  oldLastColumn = selectedColumns.value.last

            for (let r = selectedRows.value.first; r <= selectedRows.value.last; r++) {
              for (let c = selectedColumns.value.first; c <= selectedColumns.value.last; c++) {
                // Ability check handled by select.exact
                newRows.push(r)
                newColumns.push(c)
              }
            }

            select.exact(row, column)
            const a = select.nextInRow(row, column)

            if (a === 'enabled') {
              const newLastColumn = selectedColumns.value.last

              for (let r = selectedRows.value.first; r <= selectedRows.value.last; r++) {
                for (let c = oldLastColumn + 1; c <= newLastColumn; c++) {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }

              (select.exact as PlaneState<true>['select']['exact'])(newRows, newColumns, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.value.navigate(row)
              focusedColumn.value.navigate(selectedColumns.value.last)
              allowSelectOnFocus()
            }
            
            return
          }

          if (is('shift+down')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedRows.value.multiple && row === selectedRows.value.first) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
                if (selectedRows.value.picks[rowPick] === row) {
                  omits.push(rowPick)
                }
              }

              selectedRows.value.omit(omits, { reference: 'picks' })
              selectedColumns.value.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.nextInColumn(row, column)
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedRows.value.multiple && row !== selectedRows.value.last) {
              selectedRows.value.omit()
              selectedColumns.value.omit()
            }

            const newRows: number[] = [],
                  newColumns: number[] = [],
                  oldLastRow = selectedRows.value.last

            for (let r = selectedRows.value.first; r <= selectedRows.value.last; r++) {
              for (let c = selectedColumns.value.first; c <= selectedColumns.value.last; c++) {
                newRows.push(r)
                newColumns.push(c)
              }
            }

            select.exact(row, column)
            const a = select.nextInColumn(row, column)

            if (a === 'enabled') {
              const newLastRow = selectedRows.value.last

              for (let r = oldLastRow + 1; r <= newLastRow; r++) {
                for (let c = selectedColumns.value.first; c <= selectedColumns.value.last; c++) {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }

              (select.exact as PlaneState<true>['select']['exact'])(newRows, newColumns, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.value.navigate(selectedRows.value.last)
              focusedColumn.value.navigate(column)
              allowSelectOnFocus()
            }

            return
          }

          if (is('shift+left')) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedColumns.value.multiple && column === selectedColumns.value.last) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
                if (selectedColumns.value.picks[rowPick] === column) {
                  omits.push(rowPick)
                }
              }

              selectedRows.value.omit(omits, { reference: 'picks' })
              selectedColumns.value.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.previousInRow(row, column)
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedColumns.value.multiple && column !== selectedColumns.value.first) {
              selectedRows.value.omit()
              selectedColumns.value.omit()
            }

            const newRows: number[] = [],
                  newColumns: number[] = [],
                  oldFirstColumn = selectedColumns.value.first

            for (let r = selectedRows.value.first; r <= selectedRows.value.last; r++) {
              for (let c = selectedColumns.value.first; c <= selectedColumns.value.last; c++) {
                newRows.push(r)
                newColumns.push(c)
              }
            }
            
            select.exact(row, column)
            const a = select.previousInRow(row, column)
            
            if (a === 'enabled') {
              const newFirstColumn = selectedColumns.value.first
              
              for (let r = selectedRows.value.last; r >= selectedRows.value.first; r--) {
                for (let c = oldFirstColumn - 1; c >= newFirstColumn; c--) {
                  // Ability check handled by select.exact
                  newRows.unshift(r)
                  newColumns.unshift(c)
                }
              }

              (select.exact as PlaneState<true>['select']['exact'])(newRows, newColumns, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.value.navigate(row)
              focusedColumn.value.navigate(selectedColumns.value.first)
              allowSelectOnFocus()
            }

            return
          }

          if (is('ctrl+a') || is('cmd+a')) {
            event.preventDefault()

            const a = select.all()

            if (a === 'enabled') {
              preventSelectOnFocus()
              focus.exact(selectedRows.value.first, selectedColumns.value.first)
              allowSelectOnFocus()
            }
            
            return
          }
        }

        if (is('ctrl+up') || is('cmd+up')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.firstInColumn(column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('ctrl+right') || is('cmd+right')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id)
          
          const a = focus.lastInRow(row)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }
        
        if (is('ctrl+down') || is('cmd+down')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.lastInColumn(column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('ctrl+left') || is('cmd+left')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id)
          
          const a = focus.firstInRow(row)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('up')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.previousInColumn(row, column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('right')) {
          event.preventDefault()
            
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.nextInRow(row, column)
          
          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('down')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)

          const a = focus.nextInColumn(row, column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('left')) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.previousInRow(row, column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('home')) {
          event.preventDefault()
            
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('end')) {
          event.preventDefault()
            
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (!selectsOnFocus) {
          if (is('enter') || is('space')) {
            if (is('space') && query?.value) return

            event.preventDefault()
  
            const row = getRow((event.target as HTMLElement).id)
            if (row < 0) return
            const column = getColumn((event.target as HTMLElement).id, row)

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

            return
          }
        }

        if (clearable && !popup) {
          if (is('esc')) {
            event.preventDefault()
            selectedRows.value.omit()
            selectedColumns.value.omit()
            return
          }
        }
      }
    }
  )

  on(
    pointerElement,
    {
      mousedown: (event, { is }) => {
        if (multiselectable) {
          if (is('shift+mousedown')) {
            const [target, row] = getTargetAndRow(event.clientX, event.clientY)
            if (typeof row !== 'number') return
            
            event.preventDefault()
            
            const column = getColumn(target.id, row),
                  newRows: number[] = [selectedRows.value.oldest],
                  newColumns: number[] = [selectedColumns.value.oldest],
                  [startRow, endRow] = row < selectedRows.value.oldest
                    ? [row, selectedRows.value.oldest]
                    : [selectedRows.value.oldest, row],
                  [startColumn, endColumn] = column < selectedColumns.value.oldest
                    ? [column, selectedColumns.value.oldest]
                    : [selectedColumns.value.oldest, column]

            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (r === selectedRows.value.oldest && c === selectedColumns.value.oldest) continue
                if (getAbility(r, c) === 'enabled') {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact(row, column)
              selectedRows.value.pick(newRows, { allowsDuplicates: true, replace: 'all' })
              selectedColumns.value.pick(newColumns, { allowsDuplicates: true, replace: 'all' })
              allowSelectOnFocus()
            }

            return
          }

          if (is('cmd+mousedown') || is('ctrl+mousedown')) {
            const [target, row] = getTargetAndRow(event.clientX, event.clientY)
            if (typeof row !== 'number') return
            
            event.preventDefault()
            
            const column = getColumn(target.id, row)

            let indexInPicks: false | number = false
            for (let rowPick = 0; rowPick < selectedRows.value.picks.length; rowPick++) {
              if (selectedRows.value.picks[rowPick] === row && selectedColumns.value.picks[rowPick] === column) {
                indexInPicks = rowPick
                break
              }
            }

            if (typeof indexInPicks === 'number' && (clearable || selectedRows.value.picks.length > 1)) {
              preventSelectOnFocus()
              focus.exact(row, column)
              selectedRows.value.omit(indexInPicks, { reference: 'picks' })
              selectedColumns.value.omit(indexInPicks, { reference: 'picks' })
              allowSelectOnFocus()
              return
            }

            preventSelectOnFocus()
            focus.exact(row, column)
            select.exact(row, column)
            allowSelectOnFocus()

            return
          }
        }
        
        const [target, row] = getTargetAndRow(event.clientX, event.clientY)
        if (typeof row !== 'number') return
        
        const column = getColumn(target.id, row)
        
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
  )

  on<typeof pointerElement, TouchesTypes, TouchesMetadata>(
    pointerElement,
    {
      ...defineRecognizeableEffect<typeof pointerElement, TouchesTypes, TouchesMetadata>({
        createEffect: () => event => {
          event.preventDefault()
    
          const [target, row] = getTargetAndRow(event.touches[0].clientX, event.touches[0].clientY)
          if (typeof row !== 'number') return
          const column = getColumn(target.id, row)
    
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
      }),
    }
  )

  on<typeof pointerElement, MousedragTypes, MousedragMetadata>(
    pointerElement,
    {
      ...defineRecognizeableEffect<typeof pointerElement, MousedragTypes, MousedragMetadata>({
        createEffect: () => (event, { is }) => {
          const [target, row] = getTargetAndRow(event.clientX, event.clientY)
          if (typeof row !== 'number') return
          
          event.preventDefault()
          
          const column = getColumn(target.id, row),
                newRows: number[] = [selectedRows.value.oldest],
                newColumns: number[] = [selectedColumns.value.oldest],
                [startRow, endRow] = row < selectedRows.value.oldest
                  ? [row, selectedRows.value.oldest]
                  : [selectedRows.value.oldest, row],
                [startColumn, endColumn] = column < selectedColumns.value.oldest
                  ? [column, selectedColumns.value.oldest]
                  : [selectedColumns.value.oldest, column]

          for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
              if (r === selectedRows.value.oldest && c === selectedColumns.value.oldest) continue
              if (getAbility(r, c) === 'enabled') {
                newRows.push(r)
                newColumns.push(c)
              }
            }
          }

          if (newRows.length > 0) {
            preventSelectOnFocus()
            focus.exact(row, column)
            selectedRows.value.pick(newRows, { allowsDuplicates: true, replace: 'all' })
            selectedColumns.value.pick(newColumns, { allowsDuplicates: true, replace: 'all' })
            allowSelectOnFocus()
          }

          return
        },
        options: {
          listenable: {
            recognizeable: {
              effects: mousedrag({ getMousemoveTarget: () => pointerElement.value })
            },
          },
        },
      }),
    }
  )
  
  on<typeof pointerElement, TouchdragTypes, TouchdragMetadata>(
    pointerElement,
    {
      ...defineRecognizeableEffect<typeof pointerElement, TouchdragTypes, TouchdragMetadata>({
        createEffect: (_, { listenable }) => event => {
          const [target, row] = getTargetAndRow(event.touches[0].clientX, event.touches[0].clientY)
          if (typeof row !== 'number') return
          
          if (event.cancelable) event.preventDefault()
          
          const column = getColumn(target.id, row),
                newRows: number[] = [selectedRows.value.oldest],
                newColumns: number[] = [selectedColumns.value.oldest],
                [startRow, endRow] = row < selectedRows.value.oldest
                  ? [row, selectedRows.value.oldest]
                  : [selectedRows.value.oldest, row],
                [startColumn, endColumn] = column < selectedColumns.value.oldest
                  ? [column, selectedColumns.value.oldest]
                  : [selectedColumns.value.oldest, column]

          for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
              if (r === selectedRows.value.oldest && c === selectedColumns.value.oldest) continue
              if (getAbility(r, c) === 'enabled') {
                newRows.push(r)
                newColumns.push(c)
              }
            }
          }

          if (newRows.length > 0) {
            preventSelectOnFocus()
            focus.exact(row, column)
            selectedRows.value.pick(newRows, { allowsDuplicates: true, replace: 'all' })
            selectedColumns.value.pick(newColumns, { allowsDuplicates: true, replace: 'all' })
            allowSelectOnFocus()
          }

          return
        },
        options: {
          listenable: {
            recognizeable: {
              effects: touchdrag()
            },
          },
        },
      })
    }
  )

  const getTargetAndRow: (x: number, y: number) => [target: HTMLElement, row: number] | [] = (x, y) => {
          for (const element of document.elementsFromPoint(x, y)) {
            const row = getRow(element.id)
            if (row < 0) continue
            return [element as HTMLElement, row]
          }

          return []
        },
        selectOnFocus = (a: 'enabled' | 'disabled' | 'none') => {
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
