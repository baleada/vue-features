import { watch } from 'vue'
import { createMousepress, createPredicateKeycomboMatch, createTouchpress } from '@baleada/logic'
import type {
  MousepressType, MousepressMetadata,
  TouchpressType, TouchpressMetadata,
} from '@baleada/logic'
import { on, defineRecognizeableEffect } from '../affordances'
import { usePressing } from '../extensions'
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
  predicateSelected,
  preventSelectOnFocus,
  allowSelectOnFocus,
  multiselectable,
  selectsOnFocus,
  clears,
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
  predicateSelected: PlaneState<Multiselectable>['is']['selected'],
  preventSelectOnFocus: () => void,
  allowSelectOnFocus: () => void,
  multiselectable: Multiselectable,
  selectsOnFocus: UsePlaneStateConfig<Multiselectable>['selectsOnFocus'],
  clears: UsePlaneStateConfig<Multiselectable>['clears'],
  popup: UsePlaneStateConfig<Multiselectable>['popup'],
  getAbility: (row: number, column: number) => 'enabled' | 'disabled',
}) {
  // @ts-expect-error
  selectedRows.value.log = true
  on(
    keyboardElement,
    {
      keydown: (event) => {
        if (multiselectable) {
          if (createPredicateKeycomboMatch('shift+cmd+up')(event) || createPredicateKeycomboMatch('shift+ctrl+up')(event)) {
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

          if (createPredicateKeycomboMatch('shift+cmd+right')(event) || createPredicateKeycomboMatch('shift+ctrl+right')(event)) {
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

          if (createPredicateKeycomboMatch('shift+cmd+down')(event) || createPredicateKeycomboMatch('shift+ctrl+down')(event)) {
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

          if (createPredicateKeycomboMatch('shift+cmd+left')(event) || createPredicateKeycomboMatch('shift+ctrl+left')(event)) {
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

          if (createPredicateKeycomboMatch('shift+up')(event)) {
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

          if (createPredicateKeycomboMatch('shift+right')(event)) {
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

          if (createPredicateKeycomboMatch('shift+down')(event)) {
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

          if (createPredicateKeycomboMatch('shift+left')(event)) {
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

          if (createPredicateKeycomboMatch('ctrl+a')(event) || createPredicateKeycomboMatch('cmd+a')(event)) {
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

        if (createPredicateKeycomboMatch('ctrl+up')(event) || createPredicateKeycomboMatch('cmd+up')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.firstInColumn(column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('ctrl+right')(event) || createPredicateKeycomboMatch('cmd+right')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id)
          
          const a = focus.lastInRow(row)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }
        
        if (createPredicateKeycomboMatch('ctrl+down')(event) || createPredicateKeycomboMatch('cmd+down')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.lastInColumn(column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('ctrl+left')(event) || createPredicateKeycomboMatch('cmd+left')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id)
          
          const a = focus.firstInRow(row)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('up')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.previousInColumn(row, column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('right')(event)) {
          event.preventDefault()
            
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.nextInRow(row, column)
          
          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('down')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)

          const a = focus.nextInColumn(row, column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('left')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.previousInRow(row, column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('home')(event)) {
          event.preventDefault()
            
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('end')(event)) {
          event.preventDefault()
            
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (!selectsOnFocus) {
          if (createPredicateKeycomboMatch('enter')(event) || createPredicateKeycomboMatch('space')(event)) {
            if (createPredicateKeycomboMatch('space')(event) && query?.value) return

            event.preventDefault()
  
            const row = getRow((event.target as HTMLElement).id)
            if (row < 0) return
            const column = getColumn((event.target as HTMLElement).id, row)

            if (predicateSelected(row, column)) {
              if (clears || selectedRows.value.picks.length > 1) {
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

        if (clears && !popup) {
          if (createPredicateKeycomboMatch('esc')(event)) {
            event.preventDefault()
            selectedRows.value.omit()
            selectedColumns.value.omit()
            return
          }
        }
      }
    }
  )

  // PRESSING
  const pressing = usePressing(
    pointerElement,
    {
      press: {
        mouse: {
          getMousemoveTarget: () => pointerElement.value,
          onDown: ({ sequence }) => mousedownEffect(sequence.at(-1)),
          minDistance: 5,
        },
        touch: {
          onStart: ({ sequence }) => touchstartEffect(sequence.at(-1)),
          minDistance: 5,
        },
      },
      release: {
        mouse: { getMousemoveTarget: () => pointerElement.value },
      }
    }
  )

  watch(
    pressing.press,
    press => {
      switch(press.pointerType) {
        case 'mouse':
          mousepressEffect()
          break
        case 'touch':
          touchpressEffect()
          break
      }
    },
  )

  function mousedownEffect (event: MouseEvent) {
    if (multiselectable) {
      if (createPredicateKeycomboMatch('shift')(event as unknown as KeyboardEvent)) {
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

      if (
        createPredicateKeycomboMatch('cmd')(event as unknown as KeyboardEvent)
        || createPredicateKeycomboMatch('ctrl')(event as unknown as KeyboardEvent)
      ) {
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

        if (typeof indexInPicks === 'number' && (clears || selectedRows.value.picks.length > 1)) {
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
    
    if (predicateSelected(row, column)) {
      if (clears || selectedRows.value.picks.length > 1) deselect(row, column)
      return
    }

    if (multiselectable) {
      (select.exact as PlaneState<true>['select']['exact'])(row, column, { replace: 'none' })
      return
    }

    select.exact(row, column)
  }

  function touchstartEffect (event: TouchEvent) {
    event.preventDefault()

    const [target, row] = getTargetAndRow(event.touches[0].clientX, event.touches[0].clientY)
    if (typeof row !== 'number') return
    const column = getColumn(target.id, row)

    focus.exact(row, column)
    
    if (predicateSelected(row, column)) {
      if (clears || selectedRows.value.picks.length > 1) deselect(row, column)
      return
    }

    if (multiselectable) {
      (select.exact as PlaneState<true>['select']['exact'])(row, column, { replace: 'none' })
      return
    }
    
    select.exact(row, column)
  }

  function mousepressEffect () {
    const event = pressing.press.value.sequence.at(-1) as MouseEvent,
          [target, row] = getTargetAndRow(event.clientX, event.clientY)
          
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

  function touchpressEffect () {
    const event = pressing.press.value.sequence.at(-1) as TouchEvent,
          [target, row] = getTargetAndRow(event.touches[0].clientX, event.touches[0].clientY)

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
  }

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
