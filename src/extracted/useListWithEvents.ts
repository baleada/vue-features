import { ref, shallowRef, watch, computed, nextTick } from 'vue'
import type { Ref } from 'vue'
import { at, includes, pipe as link } from 'lazy-collections'
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
  preventSelect,
  allowSelect,
  orientation,
  multiselectable,
  status,
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
  preventSelect: () => void,
  allowSelect: () => void,
  orientation: UseListFeaturesConfig['orientation'],
  multiselectable: Multiselectable,
  status: ListFeatures<Multiselectable>['status'],
  clears: Clears,
  toAbility: (index: number) => Ability,
  toNextEligible: ToEligible,
  toPreviousEligible: ToEligible,
}): ListWithEvents {
  const isVertical = orientation === 'vertical',
        isHorizontal = orientation === 'horizontal',
        toEligibility = (index: number) => toAbility(index) === 'enabled' ? 'eligible' : 'ineligible',
        singleselectKeydownEffects: (
          & { toAbility: (event: KeyboardEvent) => Ability | 'none', }
          & (
            | { verticalPredicate: (event: KeyboardEvent) => boolean, horizontalPredicate: (event: KeyboardEvent) => boolean }
            | { predicate: (event: KeyboardEvent) => boolean }
          )
        )[] = [
          {
            verticalPredicate: event => createKeycomboMatch('ctrl+up')(event) || createKeycomboMatch('cmd+up')(event),
            horizontalPredicate: event => createKeycomboMatch('ctrl+left')(event) || createKeycomboMatch('cmd+left')(event),
            toAbility: () => focus.first(),
          },
          {
            verticalPredicate: event => createKeycomboMatch('ctrl+down')(event) || createKeycomboMatch('cmd+down')(event),
            horizontalPredicate: event => createKeycomboMatch('ctrl+right')(event) || createKeycomboMatch('cmd+right')(event),
            toAbility: () => focus.last(),
          },
          {
            verticalPredicate: event => predicateUp(event),
            horizontalPredicate: event => predicateLeft(event),
            toAbility: event => link(
              getIndex,
              focus.previous,
            )((event.target as HTMLElement).id),
          },
          {
            verticalPredicate: event => predicateDown(event),
            horizontalPredicate: event => predicateRight(event),
            toAbility: event => link(
              getIndex,
              focus.next,
            )((event.target as HTMLElement).id),
          },
          {
            predicate: event => predicateHome(event),
            toAbility: () => focus.first(),
          },
          {
            predicate: event => predicateEnd(event),
            toAbility: () => focus.last(),
          },
        ],
        multiselectAllDirectionalKeydownEffects: {
          toNewPicks: (event: KeyboardEvent) => number[],
          toNewLocation: (picks: number[]) => number,
          verticalPredicate: (event: KeyboardEvent) => boolean,
          horizontalPredicate: (event: KeyboardEvent) => boolean,
        }[] = [
          {
            verticalPredicate: event => createKeycomboMatch('shift+ctrl+up')(event) || createKeycomboMatch('shift+cmd+up')(event),
            horizontalPredicate: event => createKeycomboMatch('shift+ctrl+left')(event) || createKeycomboMatch('shift+cmd+left')(event),
            toNewPicks: event => {
              const index = getIndex((event.target as HTMLElement).id),
                    newIndices: number[] = []
                
              for (let i = index; i >= 0; i--) {
                if (toAbility(i) !== 'enabled') continue
                newIndices.unshift(i)
              }

              return newIndices
            },
            toNewLocation: picks => at<number>(0)(picks) as number,
          },
          {
            verticalPredicate: event => createKeycomboMatch('shift+ctrl+down')(event) || createKeycomboMatch('shift+cmd+down')(event),
            horizontalPredicate: event => createKeycomboMatch('shift+ctrl+right')(event) || createKeycomboMatch('shift+cmd+right')(event),
            toNewPicks: event => {
              const index = getIndex((event.target as HTMLElement).id),
                    newIndices: number[] = []

              for (let i = index; i < selected.array.length; i++) {
                if (toAbility(i) !== 'enabled') continue
                newIndices.push(i)
              }

              return newIndices
            },
            toNewLocation: picks => at<number>(-1)(picks) as number,
          },
        ]

  on(
    keyboardElement,
    {
      keydown: event => {
        for (const effect of singleselectKeydownEffects) {
          if (
            ('predicate' in effect && !effect.predicate(event))
            || (isVertical && 'verticalPredicate' in effect && !effect.verticalPredicate(event))
            || (isHorizontal && 'horizontalPredicate' in effect && !effect.horizontalPredicate(event))
          ) continue

          event.preventDefault()

          const { toAbility } = effect,
                a = toAbility(event)
          if (status.value === 'selecting') selectOnFocus(a)

          return
        }

        if (clears && predicateEsc(event)) {
          event.preventDefault()
          selected.omit()
          return
        }

        if (!multiselectable) return

        for (
          const {
            verticalPredicate,
            horizontalPredicate,
            toNewPicks,
            toNewLocation,
          }
          of multiselectAllDirectionalKeydownEffects
        ) {
          if (
            (isVertical && !verticalPredicate(event))
            || (isHorizontal && !horizontalPredicate(event))
          ) continue

          event.preventDefault()

          const newPicks = toNewPicks(event)

          if (!newPicks.length) return

          selected.pick(newPicks)

          preventSelect()
          link(
            toNewLocation,
            focus.exact,
          )(newPicks)
          nextTick(allowSelect)

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

          select.exact(index)
          
          if (previousEligible === 'none') return

          if (includes<number>(previousEligible)(selected.picks) as boolean) {
            if (
              nextEligible === 'none'
              || !includes<number>(nextEligible)(selected.picks) as boolean
            ) {
              selected.omit(index)

              preventSelect()
              focus.exact(previousEligible)
              nextTick(allowSelect)

              return
            }

            preventSelect()
            focus.exact(previousEligible)
            nextTick(allowSelect)

            return
          }

          select.exact(previousEligible)

          preventSelect()
          focus.exact(previousEligible)
          nextTick(allowSelect)

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

          select.exact(index)
          
          if (nextEligible === 'none') return

          if (includes<number>(nextEligible)(selected.picks) as boolean) {
            if (
              previousEligible === 'none'
              || !includes<number>(previousEligible)(selected.picks) as boolean
            ) {
              selected.omit(index)

              preventSelect()
              focus.exact(nextEligible)
              nextTick(allowSelect)

              return
            }

            preventSelect()
            focus.exact(nextEligible)
            nextTick(allowSelect)

            return
          }

          select.exact(nextEligible)

          preventSelect()
          focus.exact(nextEligible)
          nextTick(allowSelect)

          return
        }

        if (
          createKeycomboMatch('ctrl+a')(event)
          || createKeycomboMatch('cmd+a')(event)
        ) {
          event.preventDefault()

          const a = select.all()

          if (a !== 'enabled') return

          preventSelect()
          focus.exact(selected.first)
          nextTick(allowSelect)
          
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
          preventSelect()
          focus.exact(index)
          selected.pick(newIndices, { replace: 'all' })
          nextTick(allowSelect)
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
          preventSelect()
          focus.exact(index)
          selected.omit(indexInPicks, { reference: 'picks' })
          nextTick(allowSelect)
          return
        }

        preventSelect()
        focus.exact(index)
        select.exact(index)
        nextTick(allowSelect)

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
    if (status.value === 'selecting' || !selected.array.length) return

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
            case 'disabled':
              selected.omit()
              break
            case 'enabled':
              // Do nothing, handled by watch
            case 'none':
              // Do nothing
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
