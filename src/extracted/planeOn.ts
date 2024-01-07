import { watch } from 'vue'
import { createKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import { useWithPress } from '../extensions'
import type { ElementApi } from './useElementApi'
import type { PlaneFeatures, UsePlaneFeaturesConfig } from './usePlaneFeatures'

export function planeOn<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> ({
  keyboardElementApi,
  pointerElementApi,
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
  popsUp,
  getAbility,
}: {
  keyboardElementApi: ElementApi<HTMLElement, true>['element'],
  pointerElementApi: ElementApi<HTMLElement, true>['element'],
  getRow: (id: string) => number,
  getColumn: (id: string, row: number) => number,
  focusedRow: PlaneFeatures<Multiselectable>['focusedRow'],
  focusedColumn: PlaneFeatures<Multiselectable>['focusedColumn'],
  selectedRows: PlaneFeatures<Multiselectable>['selectedRows'],
  selectedColumns: PlaneFeatures<Multiselectable>['selectedColumns'],
  query?: UsePlaneFeaturesConfig<Multiselectable, Clears>['query'],
  focus: PlaneFeatures<Multiselectable>['focus'],
  select: PlaneFeatures<Multiselectable>['select'],
  deselect: PlaneFeatures<Multiselectable>['deselect'],
  predicateSelected: PlaneFeatures<Multiselectable>['is']['selected'],
  preventSelectOnFocus: () => void,
  allowSelectOnFocus: () => void,
  multiselectable: Multiselectable,
  selectsOnFocus: UsePlaneFeaturesConfig<Multiselectable, Clears>['selectsOnFocus'],
  clears: Clears,
  popsUp: UsePlaneFeaturesConfig<Multiselectable, Clears>['popsUp'],
  getAbility: (coordinates: [row: number, column: number]) => 'enabled' | 'disabled',
}) {
  // @ts-expect-error
  selectedRows.log = true
  on(
    keyboardElementApi,
    {
      keydown: event => {
        if (multiselectable) {
          if (createKeycomboMatch('shift+cmd+up')(event) || createKeycomboMatch('shift+ctrl+up')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = row; r >= 0; r--) {
              for (let c = selectedColumns.last; c >= selectedColumns.first; c--) {
                if (getAbility([r, c]) === 'enabled') {
                  newRows.unshift(r)
                  newColumns.unshift(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact([newRows[0], column])
              selectedRows.pick(newRows, { allowsDuplicates: true })
              selectedColumns.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('shift+cmd+right')(event) || createKeycomboMatch('shift+ctrl+right')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = selectedRows.first; r <= selectedRows.last; r++) {
              for (let c = column; c < selectedColumns.array.length; c++) {
                if (getAbility([r, c]) === 'enabled') {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact([row, newColumns[newColumns.length - 1]])
              selectedRows.pick(newRows, { allowsDuplicates: true })
              selectedColumns.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('shift+cmd+down')(event) || createKeycomboMatch('shift+ctrl+down')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = row; r < selectedRows.array.length; r++) {
              for (let c = selectedColumns.first; c <= selectedColumns.last; c++) {
                if (getAbility([r, c]) === 'enabled') {
                  newRows.push(r)
                  newColumns.push(c)
                }
              }
            }

            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact([newRows[newRows.length - 1], column])
              selectedRows.pick(newRows, { allowsDuplicates: true })
              selectedColumns.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('shift+cmd+left')(event) || createKeycomboMatch('shift+ctrl+left')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row),
                  newRows: number[] = [],
                  newColumns: number[] = []

            for (let r = selectedRows.last; r >= selectedRows.first; r--) {
              for (let c = column; c >= 0; c--) {
                if (getAbility([r, c]) === 'enabled') {
                  newRows.unshift(r)
                  newColumns.unshift(c)
                }
              }
            }


            if (newRows.length > 0) {
              preventSelectOnFocus()
              focus.exact([row, newColumns[0]])
              selectedRows.pick(newRows, { allowsDuplicates: true })
              selectedColumns.pick(newColumns, { allowsDuplicates: true })
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('shift+up')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedRows.multiple && row === selectedRows.last) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
                if (selectedRows.picks[rowPick] === row) {
                  omits.push(rowPick)
                }
              }

              selectedRows.omit(omits, { reference: 'picks' })
              selectedColumns.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.previousInColumn([row, column])
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedRows.multiple && row !== selectedRows.first) {
              selectedRows.omit()
              selectedColumns.omit()
            }

            const newCoordinates: [row: number, column: number][] = [],
                  oldFirstRow = selectedRows.first

            for (let r = selectedRows.first; r <= selectedRows.last; r++) {
              for (let c = selectedColumns.first; c <= selectedColumns.last; c++) {
                newCoordinates.push([r, c])
              }
            }

            select.exact([row, column])
            const a = select.previousInColumn([row, column])

            if (a === 'enabled') {
              const newFirstRow = selectedRows.first

              for (let r = oldFirstRow - 1; r >= newFirstRow; r--) {
                for (let c = selectedColumns.last; c >= selectedColumns.first; c--) {
                  newCoordinates.unshift([r, c])
                }
              }

              (select.exact as PlaneFeatures<true>['select']['exact'])(newCoordinates, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.navigate(selectedRows.first)
              focusedColumn.navigate(column)
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('shift+right')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedColumns.multiple && column === selectedColumns.first) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
                if (selectedColumns.picks[rowPick] === column) {
                  omits.push(rowPick)
                }
              }
              
              selectedRows.omit(omits, { reference: 'picks' })
              selectedColumns.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.nextInRow([row, column])
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedColumns.multiple && column !== selectedColumns.last) {
              selectedRows.omit()
              selectedColumns.omit()
            }

            const newCoordinates: [row: number, column: number][] = [],
                  oldLastColumn = selectedColumns.last

            for (let r = selectedRows.first; r <= selectedRows.last; r++) {
              for (let c = selectedColumns.first; c <= selectedColumns.last; c++) {
                newCoordinates.push([r, c])
              }
            }

            select.exact([row, column])
            const a = select.nextInRow([row, column])

            if (a === 'enabled') {
              const newLastColumn = selectedColumns.last

              for (let r = selectedRows.first; r <= selectedRows.last; r++) {
                for (let c = oldLastColumn + 1; c <= newLastColumn; c++) {
                  newCoordinates.push([r, c])
                }
              }

              (select.exact as PlaneFeatures<true>['select']['exact'])(newCoordinates, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.navigate(row)
              focusedColumn.navigate(selectedColumns.last)
              allowSelectOnFocus()
            }
            
            return
          }

          if (createKeycomboMatch('shift+down')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedRows.multiple && row === selectedRows.first) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
                if (selectedRows.picks[rowPick] === row) {
                  omits.push(rowPick)
                }
              }

              selectedRows.omit(omits, { reference: 'picks' })
              selectedColumns.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.nextInColumn([row, column])
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedRows.multiple && row !== selectedRows.last) {
              selectedRows.omit()
              selectedColumns.omit()
            }

            const newCoordinates: [row: number, column: number][] = [],
                  oldLastRow = selectedRows.last

            for (let r = selectedRows.first; r <= selectedRows.last; r++) {
              for (let c = selectedColumns.first; c <= selectedColumns.last; c++) {
                newCoordinates.push([r, c])
              }
            }

            select.exact([row, column])
            const a = select.nextInColumn([row, column])

            if (a === 'enabled') {
              const newLastRow = selectedRows.last

              for (let r = oldLastRow + 1; r <= newLastRow; r++) {
                for (let c = selectedColumns.first; c <= selectedColumns.last; c++) {
                  newCoordinates.push([r, c])
                }
              }

              (select.exact as PlaneFeatures<true>['select']['exact'])(newCoordinates, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.navigate(selectedRows.last)
              focusedColumn.navigate(column)
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('shift+left')(event)) {
            event.preventDefault()

            const row = getRow((event.target as HTMLElement).id),
                  column = getColumn((event.target as HTMLElement).id, row)

            // Shrink selection
            if (selectedColumns.multiple && column === selectedColumns.last) {
              const omits: number[] = []
              for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
                if (selectedColumns.picks[rowPick] === column) {
                  omits.push(rowPick)
                }
              }

              selectedRows.omit(omits, { reference: 'picks' })
              selectedColumns.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.previousInRow([row, column])
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selectedColumns.multiple && column !== selectedColumns.first) {
              selectedRows.omit()
              selectedColumns.omit()
            }

            const newCoordinates: [row: number, column: number][] = [],
                  oldFirstColumn = selectedColumns.first

            for (let r = selectedRows.first; r <= selectedRows.last; r++) {
              for (let c = selectedColumns.first; c <= selectedColumns.last; c++) {
                newCoordinates.push([r, c])
              }
            }
            
            select.exact([row, column])
            const a = select.previousInRow([row, column])
            
            if (a === 'enabled') {
              const newFirstColumn = selectedColumns.first
              
              for (let r = selectedRows.last; r >= selectedRows.first; r--) {
                for (let c = oldFirstColumn - 1; c >= newFirstColumn; c--) {
                  newCoordinates.unshift([r, c])
                }
              }

              (select.exact as PlaneFeatures<true>['select']['exact'])(newCoordinates, { replace: 'all' })
              
              preventSelectOnFocus()
              focusedRow.navigate(row)
              focusedColumn.navigate(selectedColumns.first)
              allowSelectOnFocus()
            }

            return
          }

          if (createKeycomboMatch('ctrl+a')(event) || createKeycomboMatch('cmd+a')(event)) {
            event.preventDefault()

            const a = select.all()

            if (a === 'enabled') {
              preventSelectOnFocus()
              focus.exact([selectedRows.first, selectedColumns.first])
              allowSelectOnFocus()
            }
            
            return
          }
        }

        if (createKeycomboMatch('ctrl+up')(event) || createKeycomboMatch('cmd+up')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.firstInColumn(column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('ctrl+right')(event) || createKeycomboMatch('cmd+right')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id)
          
          const a = focus.lastInRow(row)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }
        
        if (createKeycomboMatch('ctrl+down')(event) || createKeycomboMatch('cmd+down')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.lastInColumn(column)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('ctrl+left')(event) || createKeycomboMatch('cmd+left')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id)
          
          const a = focus.firstInRow(row)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('up')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.previousInColumn([row, column])

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('right')(event)) {
          event.preventDefault()
            
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.nextInRow([row, column])
          
          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('down')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)

          const a = focus.nextInColumn([row, column])

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('left')(event)) {
          event.preventDefault()
  
          const row = getRow((event.target as HTMLElement).id),
                column = getColumn((event.target as HTMLElement).id, row)
          
          const a = focus.previousInRow([row, column])

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('home')(event)) {
          event.preventDefault()
            
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createKeycomboMatch('end')(event)) {
          event.preventDefault()
            
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (!selectsOnFocus) {
          if (createKeycomboMatch('enter')(event) || createKeycomboMatch('space')(event)) {
            if (createKeycomboMatch('space')(event) && query?.value) return

            event.preventDefault()
  
            const row = getRow((event.target as HTMLElement).id)
            if (row < 0) return
            const column = getColumn((event.target as HTMLElement).id, row)

            if (predicateSelected([row, column])) {
              if (clears || selectedRows.picks.length > 1) {
                deselect.exact([row, column])
              }
              
              return
            }
            
            if (multiselectable) {
              (select.exact as PlaneFeatures<true>['select']['exact'])([row, column], { replace: 'none' })
            } else {
              select.exact([row, column])
            }

            return
          }
        }

        if (clears && !popsUp) {
          if (createKeycomboMatch('esc')(event)) {
            event.preventDefault()
            selectedRows.omit()
            selectedColumns.omit()
            return
          }
        }
      },
    }
  )

  // PRESSING
  const pressing = useWithPress(
    pointerElementApi,
    {
      press: {
        mouse: {
          onDown: ({ sequence }) => mousedownEffect(sequence.at(-1)),
          minDistance: 5,
        },
        touch: {
          onStart: ({ sequence }) => touchstartEffect(sequence.at(-1)),
          minDistance: 5,
        },
      },
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
      if (createKeycomboMatch('shift')(event)) {
        const [target, row] = getTargetAndRow(event.clientX, event.clientY)
        if (typeof row !== 'number') return
        
        event.preventDefault()
        
        const column = getColumn(target.id, row),
              newRows: number[] = [selectedRows.oldest],
              newColumns: number[] = [selectedColumns.oldest],
              [startRow, endRow] = row < selectedRows.oldest
                ? [row, selectedRows.oldest]
                : [selectedRows.oldest, row],
              [startColumn, endColumn] = column < selectedColumns.oldest
                ? [column, selectedColumns.oldest]
                : [selectedColumns.oldest, column]

        for (let r = startRow; r <= endRow; r++) {
          for (let c = startColumn; c <= endColumn; c++) {
            if (r === selectedRows.oldest && c === selectedColumns.oldest) continue
            if (getAbility([r, c]) === 'enabled') {
              newRows.push(r)
              newColumns.push(c)
            }
          }
        }

        if (newRows.length > 0) {
          preventSelectOnFocus()
          focus.exact([row, column])
          selectedRows.pick(newRows, { allowsDuplicates: true, replace: 'all' })
          selectedColumns.pick(newColumns, { allowsDuplicates: true, replace: 'all' })
          allowSelectOnFocus()
        }

        return
      }

      if (
        createKeycomboMatch('cmd')(event)
        || createKeycomboMatch('ctrl')(event)
      ) {
        const [target, row] = getTargetAndRow(event.clientX, event.clientY)
        if (typeof row !== 'number') return
        
        event.preventDefault()
        
        const column = getColumn(target.id, row)

        let indexInPicks: false | number = false
        for (let rowPick = 0; rowPick < selectedRows.picks.length; rowPick++) {
          if (selectedRows.picks[rowPick] === row && selectedColumns.picks[rowPick] === column) {
            indexInPicks = rowPick
            break
          }
        }

        if (typeof indexInPicks === 'number' && (clears || selectedRows.picks.length > 1)) {
          preventSelectOnFocus()
          focus.exact([row, column])
          selectedRows.omit(indexInPicks, { reference: 'picks' })
          selectedColumns.omit(indexInPicks, { reference: 'picks' })
          allowSelectOnFocus()
          return
        }

        preventSelectOnFocus()
        focus.exact([row, column])
        select.exact([row, column])
        allowSelectOnFocus()

        return
      }
    }
    
    const [target, row] = getTargetAndRow(event.clientX, event.clientY)
    if (typeof row !== 'number') return
    
    const column = getColumn(target.id, row)
    
    focus.exact([row, column])
    
    if (predicateSelected([row, column])) {
      if (clears || selectedRows.picks.length > 1) deselect.exact([row, column])
      return
    }

    if (multiselectable) {
      (select.exact as PlaneFeatures<true>['select']['exact'])([row, column], { replace: 'none' })
      return
    }

    select.exact([row, column])
  }

  function touchstartEffect (event: TouchEvent) {
    event.preventDefault()

    const [target, row] = getTargetAndRow(event.touches[0].clientX, event.touches[0].clientY)
    if (typeof row !== 'number') return
    const column = getColumn(target.id, row)

    focus.exact([row, column])
    
    if (predicateSelected([row, column])) {
      if (clears || selectedRows.picks.length > 1) deselect.exact([row, column])
      return
    }

    if (multiselectable) {
      (select.exact as PlaneFeatures<true>['select']['exact'])([row, column], { replace: 'none' })
      return
    }
    
    select.exact([row, column])
  }

  function mousepressEffect () {
    const event = pressing.press.value.sequence.at(-1) as MouseEvent,
          [target, row] = getTargetAndRow(event.clientX, event.clientY)
          
    if (typeof row !== 'number') return
    
    event.preventDefault()
    
    const column = getColumn(target.id, row),
          newRows: number[] = [selectedRows.oldest],
          newColumns: number[] = [selectedColumns.oldest],
          [startRow, endRow] = row < selectedRows.oldest
            ? [row, selectedRows.oldest]
            : [selectedRows.oldest, row],
          [startColumn, endColumn] = column < selectedColumns.oldest
            ? [column, selectedColumns.oldest]
            : [selectedColumns.oldest, column]

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startColumn; c <= endColumn; c++) {
        if (r === selectedRows.oldest && c === selectedColumns.oldest) continue
        if (getAbility([r, c]) === 'enabled') {
          newRows.push(r)
          newColumns.push(c)
        }
      }
    }    

    if (newRows.length > 0) {
      preventSelectOnFocus()
      focus.exact([row, column])
      selectedRows.pick(newRows, { allowsDuplicates: true, replace: 'all' })
      selectedColumns.pick(newColumns, { allowsDuplicates: true, replace: 'all' })
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
          newRows: number[] = [selectedRows.oldest],
          newColumns: number[] = [selectedColumns.oldest],
          [startRow, endRow] = row < selectedRows.oldest
            ? [row, selectedRows.oldest]
            : [selectedRows.oldest, row],
          [startColumn, endColumn] = column < selectedColumns.oldest
            ? [column, selectedColumns.oldest]
            : [selectedColumns.oldest, column]

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startColumn; c <= endColumn; c++) {
        if (r === selectedRows.oldest && c === selectedColumns.oldest) continue
        if (getAbility([r, c]) === 'enabled') {
          newRows.push(r)
          newColumns.push(c)
        }
      }
    }

    if (newRows.length > 0) {
      preventSelectOnFocus()
      focus.exact([row, column])
      selectedRows.pick(newRows, { allowsDuplicates: true, replace: 'all' })
      selectedColumns.pick(newColumns, { allowsDuplicates: true, replace: 'all' })
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
              selectedRows.pick(focusedRow.location, { replace: 'all' })
              selectedColumns.pick(focusedColumn.location, { replace: 'all' })
              break
            case 'disabled':
              selectedRows.omit()
              selectedColumns.omit()
              break
            case 'none':
              // do nothing
          }
        }
}
