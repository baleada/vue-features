import { ref, shallowRef, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { includes } from 'lazy-collections'
import { createKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import type { Press, Release, WithPress } from '../extensions'
import { useWithPress } from '../extensions'
import type { ElementApi } from './useElementApi'
import type { ListFeatures, UseListFeaturesConfig } from './useListFeatures'
import type { ToEligible } from './createToEligibleInList'
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
import type { Ability } from './ability'

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
  multiselectable,
  selectsOnFocus,
  clears,
  toAbility,
  toNextEligible,
  toPreviousEligible,
}: {
  // TODO: keyboard and pointer are bad distinctions now that press add keyboard listeners
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
  multiselectable: Multiselectable,
  selectsOnFocus: UseListFeaturesConfig['selectsOnFocus'],
  clears: Clears,
  toAbility: (index: number) => Ability,
  toNextEligible: ToEligible,
  toPreviousEligible: ToEligible,
}): ListWithEvents {
  const isVertical = orientation === 'vertical',
        isHorizontal = orientation === 'horizontal',
        toEligibility = (index: number) => toAbility(index) === 'enabled' ? 'eligible' : 'ineligible'

  on(
    keyboardElement,
    {
      keydown: event => {
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

        if (!multiselectable) return

        if (
          (isVertical && (createKeycomboMatch('shift+cmd+up')(event) || createKeycomboMatch('shift+ctrl+up')(event)))
          || (isHorizontal && (createKeycomboMatch('shift+cmd+left')(event) || createKeycomboMatch('shift+ctrl+left')(event)))
        ) {
          event.preventDefault()

          const index = getIndex((event.target as HTMLElement).id),
                newIndices: number[] = []
                
          for (let i = index; i >= 0; i--) {
            if (toAbility(i) !== 'enabled') continue
            newIndices.unshift(i)
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
            if (toAbility(i) === 'enabled') {
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

          const index = getIndex((event.target as HTMLElement).id),
                previousEligible = toPreviousEligible({
                  index,
                  toEligibility,
                  loops: false,
                }),
                nextEligible = toNextEligible({
                  index,
                  toEligibility,
                  loops: false,
                })
          
          if (previousEligible === 'none') return

          if (includes<number>(previousEligible)(selected.picks) as boolean) {
            if (
              nextEligible === 'none'
              || !includes<number>(nextEligible)(selected.picks) as boolean
            ) {
              selected.omit(index)

              preventSelectOnFocus()
              focus.exact(previousEligible)
              allowSelectOnFocus()

              return
            }

            preventSelectOnFocus()
            focus.exact(previousEligible)
            allowSelectOnFocus()

            return
          }

          select.exact(previousEligible)

          preventSelectOnFocus()
          let newFocused = previousEligible
          function setNewFocused () {
            const newPreviousEligible = toPreviousEligible({
              index: newFocused,
              toEligibility,
              loops: false,
            })

            if (newPreviousEligible === 'none') return

            if (!includes<number>(newPreviousEligible)(selected.picks) as boolean) return

            newFocused = newPreviousEligible
            setNewFocused()
          }
          setNewFocused()
          focus.exact(newFocused)
          allowSelectOnFocus()

          return
        }

        if (
          (isVertical && createKeycomboMatch('shift+down')(event))
          || (isHorizontal && createKeycomboMatch('shift+right')(event))
        ) {
          event.preventDefault()

          const index = getIndex((event.target as HTMLElement).id),
                nextEligible = toNextEligible({
                  index,
                  toEligibility,
                  loops: false,
                }),
                previousEligible = toPreviousEligible({
                  index,
                  toEligibility,
                  loops: false,
                })
          
          if (nextEligible === 'none') return

          if (includes<number>(nextEligible)(selected.picks) as boolean) {
            if (
              previousEligible === 'none'
              || !includes<number>(previousEligible)(selected.picks) as boolean
            ) {
              selected.omit(index)

              preventSelectOnFocus()
              focus.exact(nextEligible)
              allowSelectOnFocus()

              return
            }

            preventSelectOnFocus()
            focus.exact(nextEligible)
            allowSelectOnFocus()

            return
          }

          select.exact(nextEligible)
          preventSelectOnFocus()
          let newFocused = nextEligible
          function setNewFocused () {
            const newNextEligible = toNextEligible({
              index: newFocused,
              toEligibility,
              loops: false,
            })

            if (newNextEligible === 'none') return

            if (!includes<number>(newNextEligible)(selected.picks) as boolean) return

            newFocused = newNextEligible
            setNewFocused()
          }
          setNewFocused()
          focus.exact(newFocused)
          allowSelectOnFocus()

          return
        }

        if (
          createKeycomboMatch('ctrl+a')(event)
          || createKeycomboMatch('cmd+a')(event)
        ) {
          event.preventDefault()

          const a = select.all()

          if (a !== 'enabled') return

          preventSelectOnFocus()
          focus.exact(selected.first)
          allowSelectOnFocus()
          
          return
        }
      },
    }
  )


  // PRESSING
  const withPointerPress = useWithPress(
          pointerElement,
          {
            press: { keyboard: false },
            release: { keyboard: false },
          }
        ),
        withKeyboardPress = useWithPress(
          keyboardElement,
          {
            press: {
              mouse: false,
              touch: false,
              keyboard: { preventsDefaultUnlessDenied: false },
            },
            release: {
              mouse: false,
              touch: false,
              keyboard: { preventsDefaultUnlessDenied: false },
            },
          }
        ),
        press = shallowRef(withPointerPress.press.value),
        release = shallowRef(withPointerPress.release.value),
        pressStatus = shallowRef(withPointerPress.status.value),
        pressed = ref(-1),
        released = ref(-1)

  watch(
    [withPointerPress.press, withKeyboardPress.press],
    (current, previous) => {
      const [currentPointerPress, currentKeyboardPress] = current,
            [previousPointerPress] = previous || [],
            changedPress = currentPointerPress === previousPointerPress
              ? currentKeyboardPress
              : currentPointerPress

      press.value = changedPress
      pressed.value = getIndexFromPressOrRelease(changedPress) ?? -1
    }
  )

  watch(
    [withPointerPress.release, withKeyboardPress.release],
    (current, previous) => {
      const [currentPointerRelease, currentKeyboardRelease] = current,
            [previousPointerRelease] = previous || [],
            changedRelease = currentPointerRelease === previousPointerRelease
              ? currentKeyboardRelease
              : currentPointerRelease

      press.value = changedRelease
      released.value = getIndexFromPressOrRelease(changedRelease) ?? -1
    }
  )
  
  watch(
    [withPointerPress.status, withKeyboardPress.status],
    (current, previous) => {
      const [currentPointerStatus, currentKeyboardStatus] = current,
            [previousPointerStatus] = previous || [],
            changedStatus = currentPointerStatus === previousPointerStatus
              ? currentKeyboardStatus
              : currentPointerStatus

      pressStatus.value = changedStatus
    }
  )

  watch(
    withPointerPress.press,
    press => {
      switch (press.pointerType) {
        case 'mouse':
          mousepressEffect()
          break
        case 'touch':
          touchpressEffect()
          break
      }
    }
  )

  watch(
    withPointerPress.release,
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

  watch(
    withKeyboardPress.release,
    keyreleaseEffect,
  )

  let pressIsSelecting = false
  function createPointerEffect<EventType extends MouseEvent | TouchEvent> (
    { toClientX, toClientY }: {
      toClientX: (event: EventType) => number,
      toClientY: (event: EventType) => number
    }) {
    const firstEvent = withPointerPress.press.value.sequence.at(0) as EventType,
          lastEvent = withPointerPress.press.value.sequence.at(-1) as EventType,
          { index: firstIndex, target: firstTarget } = getTargetAndIndex(toClientX(firstEvent), toClientY(firstEvent)),
          { index: lastIndex, target: lastTarget } = getTargetAndIndex(toClientX(lastEvent), toClientY(lastEvent))
    
    pressIsSelecting = firstTarget !== lastTarget

    if (!pressIsSelecting) return

    if (typeof firstIndex !== 'number' || typeof lastIndex !== 'number') return

    lastEvent.preventDefault()

    const newPicks: number[] = []
    if (firstIndex < lastIndex) {
      for (let i = firstIndex; i <= lastIndex; i++) newPicks.push(i)
    } else {
      for (let i = firstIndex; i >= lastIndex; i--) newPicks.push(i)
    }

    ;(select.exact as ListFeatures<true>['select']['exact'])(newPicks, { replace: 'all' })
  }
  const mousepressEffect = () => createPointerEffect<MouseEvent>({
          toClientX: event => event.clientX,
          toClientY: event => event.clientY,
        }),
        touchpressEffect = () => createPointerEffect<TouchEvent>({
          toClientX: event => event.touches[0].clientX,
          toClientY: event => event.touches[0].clientY,
        })

  function mousereleaseEffect () {
    if (pressIsSelecting) {
      pressIsSelecting = false
      return
    }

    const event = withPointerPress.release.value.sequence.at(-1) as MouseEvent

    if (multiselectable) {
      if (predicateShift(event as unknown as KeyboardEvent)) {
        const { index } = getTargetAndIndex(event.clientX, event.clientY)
        if (typeof index !== 'number' || index !== pressed.value) return
        
        event.preventDefault()
        
        const newIndices: number[] = [selected.oldest],
              [startIndex, endIndex] = index < selected.oldest
                ? [index, selected.oldest]
                : [selected.oldest, index]

        for (let i = startIndex; i <= endIndex; i++) {
          if (i === selected.oldest) continue
          if (toAbility(i) === 'enabled') {
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
        if (typeof index !== 'number' || index !== pressed.value) return
        
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
    if (typeof index !== 'number' || index !== pressed.value) return
    
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
      return
    }
    
    select.exact(index)
  }
  
  function touchreleaseEffect () {
    if (pressIsSelecting) {
      pressIsSelecting = false
      return
    }

    const event = withPointerPress.release.value.sequence.at(-1) as TouchEvent

    event.preventDefault()

    const { index } = getTargetAndIndex(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
    if (index < 0 || index !== pressed.value) return

    focus.exact(index)
    
    if (predicateSelected(index)) {
      if (clears || selected.picks.length > 1) {
        deselect.exact(index)
      }
      
      return
    }

    if (multiselectable) {
      (select.exact as ListFeatures<true>['select']['exact'])(index, { replace: 'none' })
      return
    }
    
    select.exact(index)
  }

  function keyreleaseEffect () {
    if (selectsOnFocus || !selected.array.length) return

    const event = withKeyboardPress.release.value.sequence.at(-1) as KeyboardEvent

    if (query.value && predicateSpace(event)) return
  
    event.preventDefault()

    if (predicateSelected(focused.location)) {
      if (clears || selected.picks.length > 1) deselect.exact(focused.location)
      return
    }
    
    if (multiselectable) {
      (select.exact as ListFeatures<true>['select']['exact'])(focused.location, { replace: 'none' })
      return
    }

    select.exact(focused.location)
  }

  const getTargetAndIndex: (x: number, y: number) => { target?: HTMLElement, index?: number } = (x, y) => {
          for (const element of document.elementsFromPoint(x, y)) {
            const index = getIndex(element.id)
            if (index < 0) continue
            return { target: element as HTMLElement, index }
          }

          return {}
        },
        selectOnFocus = (a: Ability | 'none') => {
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
              if (!event.touches.length) return
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
    pressed: computed(() => pressed.value),
    released: computed(() => released.value),
    press: computed(() => press.value),
    release: computed(() => release.value),
    pressStatus: computed(() => pressStatus.value),
    is: {
      pressed: index => pressed.value === index,
      released: index => released.value === index,
    },
  }
}
