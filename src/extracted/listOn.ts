import { touches } from '@baleada/recognizeable-effects'
import type {
  TouchesTypes, TouchesMetadata
} from '@baleada/recognizeable-effects'
import { on, defineRecognizeableEffect } from '../affordances'
import type { IdentifiedElementApi } from './useElementApi'
import { ListState, UseListStateConfig } from './useListState'

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
  preventSelectOnFocus,
  allowSelectOnFocus,
  orientation,
  multiselectable,
  selectsOnFocus,
  stopsPropagation,
  clears,
  popup,
  getAbility,
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
  preventSelectOnFocus: () => void,
  allowSelectOnFocus: () => void,
  orientation: UseListStateConfig<Multiselectable>['orientation'],
  multiselectable: Multiselectable,
  selectsOnFocus: UseListStateConfig<Multiselectable>['selectsOnFocus'],
  stopsPropagation: UseListStateConfig<Multiselectable>['stopsPropagation'],
  clears: UseListStateConfig<Multiselectable>['clears'],
  popup: UseListStateConfig<Multiselectable>['popup'],
  getAbility: (index: number) => 'enabled' | 'disabled',
}) {
  const isVertical = orientation === 'vertical',
        isHorizontal = orientation === 'horizontal'

  on(
    keyboardElement,
    {
      keydown: (event, { is }) => {
        if (multiselectable) {
          if (
            (isVertical && (is('shift+cmd+up') || is('shift+ctrl+up')))
            || (isHorizontal && (is('shift+cmd+left') || is('shift+ctrl+left')))
          ) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()

            const index = getIndex((event.target as HTMLElement).id),
                  newIndices: number[] = []

            for (let i = index; i >= 0; i--) {
              if (getAbility(i) === 'enabled') {
                newIndices.unshift(i)
              }
            }

            if (newIndices.length > 0) {
              preventSelectOnFocus()
              focus.exact(newIndices[0])
              selected.value.pick(newIndices)
              allowSelectOnFocus()
            }

            return
          }

          if (
            (isVertical && (is('shift+cmd+down') || is('shift+ctrl+down')))
            || (isHorizontal && (is('shift+cmd+right') || is('shift+ctrl+right')))
          ) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()

            const index = getIndex((event.target as HTMLElement).id),
                  newIndices: number[] = []

            for (let i = index; i < selected.value.array.length; i++) {
              if (getAbility(i) === 'enabled') {
                newIndices.push(i)
              }
            }

            if (newIndices.length > 0) {
              preventSelectOnFocus()
              focus.exact(newIndices[newIndices.length - 1])
              selected.value.pick(newIndices)
              allowSelectOnFocus()
            }

            return
          }

          if (
            (isVertical && is('shift+up'))
            || (isHorizontal && is('shift+left'))
          ) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()

            const index = getIndex((event.target as HTMLElement).id)

            // Shrink selection
            if (selected.value.multiple && index === selected.value.last) {
              // TODO: Simplify to remove plane-specific logic
              const omits: number[] = []
              for (let pick = 0; pick < selected.value.picks.length; pick++) {
                if (selected.value.picks[pick] === index) {
                  omits.push(pick)
                }
              }

              selected.value.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.previous(index)
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selected.value.multiple && index !== selected.value.first) {
              selected.value.omit()
            }

            const newIndices: number[] = [],
                  oldFirst = selected.value.first

            for (let i = selected.value.first; i <= selected.value.last; i++) {
              if (getAbility(i) === 'enabled') {
                // Ability check handled by select.exact
                newIndices.push(i)
              }
            }

            select.exact(index)
            const a = select.previous(index)

            if (a === 'enabled') {
              const newFirst = selected.value.first

              for (let i = oldFirst - 1; i >= newFirst; i--) {
                newIndices.unshift(i)
              }

              (select.exact as ListState<true>['select']['exact'])(newIndices, { replace: 'all' })
              
              preventSelectOnFocus()
              focused.value.navigate(selected.value.first)
              allowSelectOnFocus()
            }

            return
          }

          if (
            (isVertical && is('shift+down'))
            || (isHorizontal && is('shift+right'))
          ) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()

            const index = getIndex((event.target as HTMLElement).id)

            // Shrink selection
            if (selected.value.multiple && index === selected.value.first) {
              // TODO: Simplify to remove plane-specific logic
              const omits: number[] = []
              for (let pick = 0; pick < selected.value.picks.length; pick++) {
                if (selected.value.picks[pick] === index) {
                  omits.push(pick)
                }
              }

              selected.value.omit(omits, { reference: 'picks' })

              preventSelectOnFocus()
              focus.next(index)
              allowSelectOnFocus()
              return
            }
            
            // Reset selection if starting multiselect from the middle
            if (selected.value.multiple && index !== selected.value.last) {
              selected.value.omit()
            }

            const newIndices: number[] = [],
                  oldLast = selected.value.last

            for (let i = selected.value.first; i <= selected.value.last; i++) {
              // Ability check handled by select.exact
              newIndices.push(i)
            }

            select.exact(index)
            const a = select.next(index)

            if (a === 'enabled') {
              const newLast = selected.value.last

              for (let i = oldLast + 1; i <= newLast; i++) {
                newIndices.push(i)
              }

              (select.exact as ListState<true>['select']['exact'])(newIndices, { replace: 'all' })
              
              preventSelectOnFocus()
              focused.value.navigate(selected.value.last)
              allowSelectOnFocus()
            }

            return
          }

          if (is('ctrl+a') || is('cmd+a')) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()

            const a = select.all()

            if (a === 'enabled') {
              preventSelectOnFocus()
              focus.exact(selected.value.first)
              allowSelectOnFocus()
            }
            
            return
          }
        }

        if (
          (isVertical && (is('ctrl+up') || is('cmd+up')))
          || (isHorizontal && (is('ctrl+left') || is('cmd+left')))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }
        
        if (
          (isVertical && (is('ctrl+down') || is('cmd+down')))
          || (isHorizontal && (is('ctrl+right') || is('cmd+right')))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (
          (isVertical && is('up'))
          || (isHorizontal && is('left'))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const index = getIndex((event.target as HTMLElement).id)
          
          const a = focus.previous(index)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (
          (isVertical && is('down'))
          || (isHorizontal && is('right'))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const index = getIndex((event.target as HTMLElement).id)

          const a = focus.next(index)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('home')) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
            
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (is('end')) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
            
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (!selectsOnFocus) {
          if (is('enter') || is('space')) {
            if (is('space') && query?.value) return

            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()
  
            const index = getIndex((event.target as HTMLElement).id)

            if (isSelected(index)) {
              if (clears || selected.value.picks.length > 1) deselect(index)
              return
            }
            
            if (multiselectable) {
              (select.exact as ListState<true>['select']['exact'])(index, { replace: 'none' })
            } else {
              select.exact(index)
            }

            return
          }
        }

        if (clears && !popup) {
          if (is('esc')) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()
            selected.value.omit()
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
            const [target, index] = getTargetAndIndex(event.clientX, event.clientY)
            if (typeof index !== 'number') return
            
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()
            
            const newIndices: number[] = [selected.value.oldest],
                  [startIndex, endIndex] = index < selected.value.oldest
                    ? [index, selected.value.oldest]
                    : [selected.value.oldest, index]

            for (let i = startIndex; i <= endIndex; i++) {
              if (i === selected.value.oldest) continue
              if (getAbility(i) === 'enabled') {
                newIndices.push(i)
              }
            }

            if (newIndices.length > 0) {
              preventSelectOnFocus()
              focus.exact(index)
              selected.value.pick(newIndices, { replace: 'all' })
              allowSelectOnFocus()
            }

            return
          }

          if (is('cmd+mousedown') || is('ctrl+mousedown')) {
            const [target, index] = getTargetAndIndex(event.clientX, event.clientY)
            if (typeof index !== 'number') return
            
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()

            // TODO: Simplify to remove plane-specific logic
            let indexInPicks: false | number = false
            for (let pick = 0; pick < selected.value.picks.length; pick++) {
              if (selected.value.picks[pick] === index) {
                indexInPicks = pick
                break
              }
            }

            if (typeof indexInPicks === 'number' && (clears || selected.value.picks.length > 1)) {
              preventSelectOnFocus()
              focus.exact(index)
              selected.value.omit(indexInPicks, { reference: 'picks' })
              allowSelectOnFocus()
              return
            }

            preventSelectOnFocus()
            focus.exact(index)
            select.exact(index)
            allowSelectOnFocus()

            return
          }
        }
        
        const [target, index] = getTargetAndIndex(event.clientX, event.clientY)
        if (typeof index !== 'number') return
        
        event.preventDefault()
        if (stopsPropagation) event.stopPropagation()
        
        focus.exact(index)
        
        if (isSelected(index)) {
          if (clears || selected.value.picks.length > 1) {
            deselect(index)
          }
          
          return
        }

        if (multiselectable) {
          (select.exact as ListState<true>['select']['exact'])(index, { replace: 'none' })
        } else {
          select.exact(index)
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
          if (stopsPropagation) event.stopPropagation()
    
          const index = getIndex((event.target as HTMLElement).id)
          if (index < 0) return
    
          focus.exact(index)
          
          if (isSelected(index)) {
            if (clears || selected.value.picks.length > 1) {
              deselect(index)
            }
            
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
      }),
    }
  )

  const getTargetAndIndex: (x: number, y: number) => [target: HTMLElement, row: number] | [] = (x, y) => {
          for (const element of document.elementsFromPoint(x, y)) {
            const index = getIndex(element.id)
            if (index < 0) continue
            return [element as HTMLElement, index]
          }

          return []
        },
        selectOnFocus = (a: 'enabled' | 'disabled' | 'none') => {
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
