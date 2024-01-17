import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { createKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import type { Press, Release, WithPress } from '../extensions'
import { useWithPress } from '../extensions'
import type { ElementApi } from './useElementApi'
import type { ListFeatures, UseListFeaturesConfig } from './useListFeatures'
import {
  predicateCmd,
  predicateCtrl,
  predicateDown,
  predicateEnd,
  predicateEsc,
  predicateHome,
  predicateLeft,
  predicateRight,
  predicateShift,
  predicateSpace,
  predicateUp,
} from './predicateKeycombo'

export type ListWithEvents = {
  pressed: Ref<number>,
  released: Ref<number>,
  press: WithPress['press'],
  release: WithPress['release'],
  pressStatus: WithPress['status'],
  is: {
    pressed: (index: number) => boolean,
    released: (index: number) => boolean,
  },
}

export function useListWithEvents<
  Multiselectable extends boolean = false,
  Clears extends boolean = true
> ({
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
  transfersFocus,
  multiselectable,
  selectsOnFocus,
  clears,
  getAbility,
}: {
  keyboardElement: ElementApi<HTMLElement, true>['element'],
  pointerElement: ElementApi<HTMLElement, true>['element'],
  getIndex: (id: string) => number,
  focused: ListFeatures<Multiselectable>['focused'],
  selected: ListFeatures<Multiselectable>['selected'],
  query: ListFeatures<Multiselectable>['query'],
  focus: ListFeatures<Multiselectable>['focus'],
  select: ListFeatures<Multiselectable>['select'],
  deselect: ListFeatures<Multiselectable>['deselect'],
  predicateSelected: ListFeatures<Multiselectable>['is']['selected'],
  preventSelectOnFocus: () => void,
  allowSelectOnFocus: () => void,
  orientation: UseListFeaturesConfig['orientation'],
  transfersFocus: UseListFeaturesConfig['transfersFocus'],
  multiselectable: Multiselectable,
  selectsOnFocus: UseListFeaturesConfig['selectsOnFocus'],
  clears: Clears,
  getAbility: (index: number) => 'enabled' | 'disabled',
}): ListWithEvents {
  const isVertical = orientation === 'vertical',
        isHorizontal = orientation === 'horizontal'

  if (transfersFocus) {
    on(
      keyboardElement,
      {
        keydown: event => {
          if (multiselectable) {
            if (
              (isVertical && (createKeycomboMatch('shift+cmd+up')(event) || createKeycomboMatch('shift+ctrl+up')(event)))
              || (isHorizontal && (createKeycomboMatch('shift+cmd+left')(event) || createKeycomboMatch('shift+ctrl+left')(event)))
            ) {
              event.preventDefault()
  
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
                selected.pick(newIndices)
                allowSelectOnFocus()
              }
  
              return
            }
  
            if (
              (isVertical && (createKeycomboMatch('shift+cmd+down')(event) || createKeycomboMatch('shift+ctrl+down')(event)))
              || (isHorizontal && (createKeycomboMatch('shift+cmd+right')(event) || createKeycomboMatch('shift+ctrl+right')(event)))
            ) {
              event.preventDefault()
  
              const index = getIndex((event.target as HTMLElement).id),
                    newIndices: number[] = []
  
              for (let i = index; i < selected.array.length; i++) {
                if (getAbility(i) === 'enabled') {
                  newIndices.push(i)
                }
              }
  
              if (newIndices.length > 0) {
                preventSelectOnFocus()
                focus.exact(newIndices[newIndices.length - 1])
                selected.pick(newIndices)
                allowSelectOnFocus()
              }
  
              return
            }
  
            if (
              (isVertical && createKeycomboMatch('shift+up')(event))
              || (isHorizontal && createKeycomboMatch('shift+left')(event))
            ) {
              event.preventDefault()
  
              const index = getIndex((event.target as HTMLElement).id)
  
              // Shrink selection
              if (selected.multiple && index === selected.last) {
                // TODO: Simplify to remove plane-specific logic
                const omits: number[] = []
                for (let pick = 0; pick < selected.picks.length; pick++) {
                  if (selected.picks[pick] === index) {
                    omits.push(pick)
                  }
                }
  
                selected.omit(omits, { reference: 'picks' })
  
                preventSelectOnFocus()
                focus.previous(index)
                allowSelectOnFocus()
                return
              }
              
              // Reset selection if starting multiselect from the middle
              if (selected.multiple && index !== selected.first) {
                selected.omit()
              }
  
              const newIndices: number[] = [],
                    oldFirst = selected.first
  
              for (let i = selected.first; i <= selected.last; i++) {
                if (getAbility(i) === 'enabled') {
                  // Ability check handled by select.exact
                  newIndices.push(i)
                }
              }
  
              select.exact(index)
              const a = select.previous(index)
  
              if (a === 'enabled') {
                const newFirst = selected.first
  
                for (let i = oldFirst - 1; i >= newFirst; i--) {
                  newIndices.unshift(i)
                }
  
                (select.exact as ListFeatures<true>['select']['exact'])(newIndices, { replace: 'all' })
                
                preventSelectOnFocus()
                focused.navigate(selected.first)
                allowSelectOnFocus()
              }
  
              return
            }
  
            if (
              (isVertical && createKeycomboMatch('shift+down')(event))
              || (isHorizontal && createKeycomboMatch('shift+right')(event))
            ) {
              event.preventDefault()
  
              const index = getIndex((event.target as HTMLElement).id)
  
              // Shrink selection
              if (selected.multiple && index === selected.first) {
                // TODO: Simplify to remove plane-specific logic
                const omits: number[] = []
                for (let pick = 0; pick < selected.picks.length; pick++) {
                  if (selected.picks[pick] === index) {
                    omits.push(pick)
                  }
                }
  
                selected.omit(omits, { reference: 'picks' })
  
                preventSelectOnFocus()
                focus.next(index)
                allowSelectOnFocus()
                return
              }
              
              // Reset selection if starting multiselect from the middle
              if (selected.multiple && index !== selected.last) {
                selected.omit()
              }
  
              const newIndices: number[] = [],
                    oldLast = selected.last
  
              for (let i = selected.first; i <= selected.last; i++) {
                // Ability check handled by select.exact
                newIndices.push(i)
              }
  
              select.exact(index)
              const a = select.next(index)
  
              if (a === 'enabled') {
                const newLast = selected.last
  
                for (let i = oldLast + 1; i <= newLast; i++) {
                  newIndices.push(i)
                }
  
                (select.exact as ListFeatures<true>['select']['exact'])(newIndices, { replace: 'all' })
                
                preventSelectOnFocus()
                focused.navigate(selected.last)
                allowSelectOnFocus()
              }
  
              return
            }
  
            if (createKeycomboMatch('ctrl+a')(event) || createKeycomboMatch('cmd+a')(event)) {
              event.preventDefault()
  
              const a = select.all()
  
              if (a === 'enabled') {
                preventSelectOnFocus()
                focus.exact(selected.first)
                allowSelectOnFocus()
              }
              
              return
            }
          }
  
          if (
            (isVertical && (createKeycomboMatch('ctrl+up')(event) || createKeycomboMatch('cmd+up')(event)))
            || (isHorizontal && (createKeycomboMatch('ctrl+left')(event) || createKeycomboMatch('cmd+left')(event)))
          ) {
            event.preventDefault()
    
            const a = focus.first()
  
            if (selectsOnFocus) selectOnFocus(a)
            return
          }
          
          if (
            (isVertical && (createKeycomboMatch('ctrl+down')(event) || createKeycomboMatch('cmd+down')(event)))
            || (isHorizontal && (createKeycomboMatch('ctrl+right')(event) || createKeycomboMatch('cmd+right')(event)))
          ) {
            event.preventDefault()
    
            const a = focus.last()
  
            if (selectsOnFocus) selectOnFocus(a)
            return
          }
  
          if (
            (isVertical && predicateUp(event))
            || (isHorizontal && predicateLeft(event))
          ) {
            event.preventDefault()
    
            const index = getIndex((event.target as HTMLElement).id)
            
            const a = focus.previous(index)
  
            if (selectsOnFocus) selectOnFocus(a)
            return
          }
  
          if (
            (isVertical && predicateDown(event))
            || (isHorizontal && predicateRight(event))
          ) {
            event.preventDefault()
    
            const index = getIndex((event.target as HTMLElement).id)
  
            const a = focus.next(index)
  
            if (selectsOnFocus) selectOnFocus(a)
            return
          }
  
          if (predicateHome(event)) {
            event.preventDefault()
              
            const a = focus.first()
  
            if (selectsOnFocus) selectOnFocus(a)
            return
          }
  
          if (predicateEnd(event)) {
            event.preventDefault()
              
            const a = focus.last()
  
            if (selectsOnFocus) selectOnFocus(a)
            return
          }
  
          if (clears && predicateEsc(event)) {
            event.preventDefault()
            selected.omit()
            return
          }
        },
      }
    )
  }


  // PRESSING
  const withPress = useWithPress(pointerElement),
        pressedIndex = ref(-1),
        releasedIndex = ref(-1)

  watch(
    withPress.press,
    press => {
      pressedIndex.value = getIndexFromPressOrRelease(press) ?? -1
    }
  )

  watch(
    withPress.release,
    release => {
      releasedIndex.value = getIndexFromPressOrRelease(release) ?? -1
    }
  )

  watch(
    withPress.release,
    release => {
      switch(release.pointerType) {
        case 'mouse':
          mousereleaseEffect()
          break
        case 'touch':
          touchreleaseEffect()
          break
        case 'keyboard':
          keyreleaseEffect()
      }
    }
  )

  function mousereleaseEffect () {
    const event = withPress.release.value.sequence.at(-1) as MouseEvent

    if (multiselectable) {
      if (predicateShift(event as unknown as KeyboardEvent)) {
        const { index } = getTargetAndIndex(event.clientX, event.clientY)
        if (typeof index !== 'number' || index !== pressedIndex.value) return
        
        event.preventDefault()
        
        const newIndices: number[] = [selected.oldest],
              [startIndex, endIndex] = index < selected.oldest
                ? [index, selected.oldest]
                : [selected.oldest, index]

        for (let i = startIndex; i <= endIndex; i++) {
          if (i === selected.oldest) continue
          if (getAbility(i) === 'enabled') {
            newIndices.push(i)
          }
        }

        if (newIndices.length > 0) {
          preventSelectOnFocus()
          focus.exact(index)
          selected.pick(newIndices, { replace: 'all' })
          allowSelectOnFocus()
        }

        return
      }

      if (predicateCmd(event as unknown as KeyboardEvent) || predicateCtrl(event as unknown as KeyboardEvent)) {
        const { index } = getTargetAndIndex(event.clientX, event.clientY)
        if (typeof index !== 'number' || index !== pressedIndex.value) return
        
        event.preventDefault()

        // TODO: Simplify to remove plane-specific logic
        let indexInPicks: false | number = false
        for (let pick = 0; pick < selected.picks.length; pick++) {
          if (selected.picks[pick] === index) {
            indexInPicks = pick
            break
          }
        }

        if (typeof indexInPicks === 'number' && (clears || selected.picks.length > 1)) {
          preventSelectOnFocus()
          focus.exact(index)
          selected.omit(indexInPicks, { reference: 'picks' })
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
    
    const { index } = getTargetAndIndex(event.clientX, event.clientY)
    if (typeof index !== 'number' || index !== pressedIndex.value) return
    
    event.preventDefault()
    
    focus.exact(index)
    
    if (predicateSelected(index)) {
      if (clears || selected.picks.length > 1) {
        deselect.exact(index)
      }
      
      return
    }

    if (multiselectable) {
      (select.exact as ListFeatures<true>['select']['exact'])(index, { replace: 'none' })
    } else {
      select.exact(index)
    }
  }
  
  function touchreleaseEffect () {
    const event = withPress.release.value.sequence.at(-1) as TouchEvent

    event.preventDefault()

    const { index } = getTargetAndIndex(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
    if (index < 0 || index !== pressedIndex.value) return

    focus.exact(index)
    
    if (predicateSelected(index)) {
      if (clears || selected.picks.length > 1) {
        deselect.exact(index)
      }
      
      return
    }

    if (multiselectable) {
      (select.exact as ListFeatures<true>['select']['exact'])(index, { replace: 'none' })
    } else {
      select.exact(index)
    }
  }

  function keyreleaseEffect () {
    if (selectsOnFocus) return

    const event = withPress.release.value.sequence.at(-1) as KeyboardEvent

    if (query.value && predicateSpace(event)) return
  
    event.preventDefault()

    const index = getIndex((event.target as HTMLElement).id)

    if (predicateSelected(index)) {
      if (clears || selected.picks.length > 1) deselect.exact(index)
      return
    }
    
    if (multiselectable) {
      (select.exact as ListFeatures<true>['select']['exact'])(index, { replace: 'none' })
    } else {
      select.exact(index)
    }

    return
  }

  const getTargetAndIndex: (x: number, y: number) => { target?: HTMLElement, index?: number } = (x, y) => {
          for (const element of document.elementsFromPoint(x, y)) {
            const index = getIndex(element.id)
            if (index < 0) continue
            return { target: element as HTMLElement, index }
          }

          return {}
        },
        selectOnFocus = (a: 'enabled' | 'disabled' | 'none') => {
          switch (a) {
            case 'enabled':
              selected.pick(focused.location, { replace: 'all' })
              break
            case 'disabled':
              selected.omit()
              break
            case 'none':
              // do nothing
          }
        },
        getIndexFromPressOrRelease = (pressOrRelease: Press | Release) => {
          switch (pressOrRelease.pointerType) {
            case 'mouse': {
              const event = pressOrRelease.sequence.at(-1) as MouseEvent
              const { index } = getTargetAndIndex(event.clientX, event.clientY)
              return index
            }
            case 'touch': {
              const event = pressOrRelease.sequence.at(-1) as TouchEvent
              const { index } = getTargetAndIndex(event.touches[0].clientX, event.touches[0].clientY)
              return index
            }
            case 'keyboard': {
              const event = pressOrRelease.sequence.at(-1) as KeyboardEvent
              return getIndex((event.target as HTMLElement).id)
            }
          }
        }

  return {
    pressed: computed(() => pressedIndex.value),
    released: computed(() => releasedIndex.value),
    press: withPress.press,
    release: withPress.release,
    pressStatus: withPress.status,
    is: {
      pressed: index => pressedIndex.value === index,
      released: index => releasedIndex.value === index,
    },
  }
}
