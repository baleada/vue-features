import { watch } from 'vue'
import { createPredicateKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import { usePressing } from '../extensions'
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
  predicateSelected,
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
  predicateSelected: ListState<Multiselectable>['is']['selected'],
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
      keydown: (event) => {
        if (multiselectable) {
          if (
            (isVertical && (createPredicateKeycomboMatch('shift+cmd+up')(event) || createPredicateKeycomboMatch('shift+ctrl+up')(event)))
            || (isHorizontal && (createPredicateKeycomboMatch('shift+cmd+left')(event) || createPredicateKeycomboMatch('shift+ctrl+left')(event)))
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
            (isVertical && (createPredicateKeycomboMatch('shift+cmd+down')(event) || createPredicateKeycomboMatch('shift+ctrl+down')(event)))
            || (isHorizontal && (createPredicateKeycomboMatch('shift+cmd+right')(event) || createPredicateKeycomboMatch('shift+ctrl+right')(event)))
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
            (isVertical && createPredicateKeycomboMatch('shift+up')(event))
            || (isHorizontal && createPredicateKeycomboMatch('shift+left')(event))
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
            (isVertical && createPredicateKeycomboMatch('shift+down')(event))
            || (isHorizontal && createPredicateKeycomboMatch('shift+right')(event))
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

          if (createPredicateKeycomboMatch('ctrl+a')(event) || createPredicateKeycomboMatch('cmd+a')(event)) {
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
          (isVertical && (createPredicateKeycomboMatch('ctrl+up')(event) || createPredicateKeycomboMatch('cmd+up')(event)))
          || (isHorizontal && (createPredicateKeycomboMatch('ctrl+left')(event) || createPredicateKeycomboMatch('cmd+left')(event)))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }
        
        if (
          (isVertical && (createPredicateKeycomboMatch('ctrl+down')(event) || createPredicateKeycomboMatch('cmd+down')(event)))
          || (isHorizontal && (createPredicateKeycomboMatch('ctrl+right')(event) || createPredicateKeycomboMatch('cmd+right')(event)))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (
          (isVertical && createPredicateKeycomboMatch('up')(event))
          || (isHorizontal && createPredicateKeycomboMatch('left')(event))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const index = getIndex((event.target as HTMLElement).id)
          
          const a = focus.previous(index)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (
          (isVertical && createPredicateKeycomboMatch('down')(event))
          || (isHorizontal && createPredicateKeycomboMatch('right')(event))
        ) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
  
          const index = getIndex((event.target as HTMLElement).id)

          const a = focus.next(index)

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('home')(event)) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
            
          const a = focus.first()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (createPredicateKeycomboMatch('end')(event)) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
            
          const a = focus.last()

          if (selectsOnFocus) selectOnFocus(a)
          return
        }

        if (!selectsOnFocus) {
          if (createPredicateKeycomboMatch('enter')(event) || createPredicateKeycomboMatch('space')(event)) {
            if (createPredicateKeycomboMatch('space')(event) && query?.value) return

            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()
  
            const index = getIndex((event.target as HTMLElement).id)

            if (predicateSelected(index)) {
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
          if (createPredicateKeycomboMatch('esc')(event)) {
            event.preventDefault()
            if (stopsPropagation) event.stopPropagation()
            selected.value.omit()
            return
          }
        }
      }
    }
  )

  
  const pressing = usePressing(
    pointerElement,
    { mouse: { getMousemoveTarget: () => pointerElement.value } }
  )
  let pressedIndex: number | undefined = -1

  watch(
    pressing.status,
    status => {
      if (status === 'pressed') {
        switch (pressing.press.value.pointerType) {
          case 'mouse': {
            const event = pressing.press.value.sequence.at(-1) as MouseEvent
            const [target, index] = getTargetAndIndex(event.clientX, event.clientY)
            pressedIndex = index
            break
          }
          case 'touch': {
            const event = pressing.press.value.sequence.at(-1) as TouchEvent
            const [target, index] = getTargetAndIndex(event.touches[0].clientX, event.touches[0].clientY)
            pressedIndex = index
            break
          }
        }
      } 
    }
  )

  watch(
    pressing.release,
    release => {
      switch(release.pointerType) {
        case 'mouse':
          mousereleaseEffect()
          break
        case 'touch':
          touchreleaseEffect()
          break
      }
    }
  )

  function mousereleaseEffect () {
    const event = pressing.release.value.sequence.at(-1) as MouseEvent

    if (multiselectable) {
      if (createPredicateKeycomboMatch('shift')(event as unknown as KeyboardEvent)) {
        const [target, index] = getTargetAndIndex(event.clientX, event.clientY)
        if (typeof index !== 'number' || index !== pressedIndex) return
        
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

      if (createPredicateKeycomboMatch('cmd')(event as unknown as KeyboardEvent) || createPredicateKeycomboMatch('ctrl')(event as unknown as KeyboardEvent)) {
        const [target, index] = getTargetAndIndex(event.clientX, event.clientY)
        if (typeof index !== 'number' || index !== pressedIndex) return
        
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
    if (typeof index !== 'number' || index !== pressedIndex) return
    
    event.preventDefault()
    if (stopsPropagation) event.stopPropagation()
    
    focus.exact(index)
    
    if (predicateSelected(index)) {
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
  }
  
  function touchreleaseEffect () {
    const event = pressing.release.value.sequence.at(-1) as TouchEvent

    event.preventDefault()
    if (stopsPropagation) event.stopPropagation()

    const [target, index] = getTargetAndIndex(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
    if (index < 0 || index !== pressedIndex) return

    focus.exact(index)
    
    if (predicateSelected(index)) {
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
  }

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
