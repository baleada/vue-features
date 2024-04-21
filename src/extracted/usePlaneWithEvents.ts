import { ref, shallowRef, watch, computed, nextTick } from 'vue'
import type { Ref } from 'vue'
import {
  at,
  map,
  min,
  max,
  pipe as link,
  pipe,
  find,
} from 'lazy-collections'
import { createKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import type { Press, Release, WithPress } from '../extensions'
import { useWithPress } from '../extensions'
import type { ElementApi } from './useElementApi'
import type { PlaneFeatures } from './usePlaneFeatures'
import type { ToEligible } from './createToEligibleInPlane'
import {
  predicateDown,
  predicateEnd,
  predicateEsc,
  predicateHome,
  predicateLeft,
  predicateRight,
  predicateSpace,
  predicateUp,
} from './predicateKeycombo'
import type { Ability } from './ability'
import { createCoordinatesEqual } from './createCoordinatesEqual'
import type { Coordinates } from './coordinates'

export type PlaneWithEvents = {
  pressed: Ref<Coordinates>,
  released: Ref<Coordinates>,
  press: WithPress['press'],
  release: WithPress['release'],
  pressStatus: WithPress['status'],
  is: {
    pressed: (coordinates: Coordinates) => boolean,
    released: (coordinates: Coordinates) => boolean,
  },
}

export function usePlaneWithEvents<
  Multiselectable extends boolean = false,
  Clears extends boolean = true
> ({
  keyboardElement,
  pointerElement,
  getCoordinates,
  focused,
  selectedRows,
  selectedColumns,
  query,
  focus,
  select,
  deselect,
  predicateSelected,
  preventSelect,
  allowSelect,
  superselectedStartIndex,
  superselected,
  status,
  multiselectable,
  clears,
  toAbility,
  toNextEligible,
  toPreviousEligible,
}: {
  // TODO: keyboard and pointer are bad distinctions now that press add keyboard listeners
  keyboardElement: ElementApi<HTMLElement, true>['element'],
  pointerElement: ElementApi<HTMLElement, true>['element'],
  getCoordinates: (id: string) => Coordinates,
  focused: PlaneFeatures<Multiselectable>['focused'],
  selectedRows: PlaneFeatures<Multiselectable>['selectedRows'],
  selectedColumns: PlaneFeatures<Multiselectable>['selectedColumns'],
  query: PlaneFeatures<Multiselectable>['query'],
  focus: PlaneFeatures<Multiselectable>['focus'],
  select: PlaneFeatures<Multiselectable>['select'],
  deselect: PlaneFeatures<Multiselectable>['deselect'],
  predicateSelected: PlaneFeatures<Multiselectable>['is']['selected'],
  preventSelect: () => void,
  allowSelect: () => void,
  superselectedStartIndex: Ref<number>,
  superselected: PlaneFeatures<Multiselectable>['superselected'],
  status: PlaneFeatures<Multiselectable>['status'],
  multiselectable: Multiselectable,
  clears: Clears,
  toAbility: (coordinates: Coordinates) => Ability,
  toNextEligible: ToEligible,
  toPreviousEligible: ToEligible,
}): PlaneWithEvents {
  const toEligibility = (coordinates: Coordinates) => toAbility(coordinates) === 'enabled' ? 'eligible' : 'ineligible',
        maybeNullifySuperselectedStartIndex = (event: KeyboardEvent | MouseEvent | TouchEvent) => {
          if (
            event.shiftKey
            || event.metaKey
            || event.ctrlKey
          ) return
          superselectedStartIndex.value = 0
        },
        maybeEstablishSuperselectedStartIndex = (event: KeyboardEvent | MouseEvent | TouchEvent) => {
          if (
            !event.shiftKey
            && !event.metaKey
            && !event.ctrlKey
          ) return

          establishSuperselectedStartIndex()
        },
        establishSuperselectedStartIndex = () => {
          superselectedStartIndex.value = selectedRows.picks.length - 1 // TODO: I think?
        },
        getSuperselectedBounds = () => ({
          minRow: pipe<Coordinates[]>(
            map<Coordinates, number>(([row]) => row),
            min(),
          )(superselected.value) as number,
          maxRow: pipe<Coordinates[]>(
            map<Coordinates, number>(([row]) => row),
            max(),
          )(superselected.value) as number,
          minColumn: pipe<Coordinates[]>(
            map<Coordinates, number>(([_, column]) => column),
            min(),
          )(superselected.value) as number,
          maxColumn: pipe<Coordinates[]>(
            map<Coordinates, number>(([_, column]) => column),
            max(),
          )(superselected.value) as number,
        }),
        singleselectKeydownEffects: {
          predicate: (event: KeyboardEvent) => boolean,
          getAbility: () => Ability | 'none',
        }[] = [
          {
            predicate: event => predicateCtrlUp(event) || predicateCmdUp(event),
            getAbility: () => link(
              at<number>(1),
              focus.firstInColumn,
            )(focused.value),
          },
          {
            predicate: event => predicateCtrlLeft(event) || predicateCmdLeft(event),
            getAbility: () => link(
              at<number>(0),
              focus.firstInRow,
            )(focused.value),
          },
          {
            predicate: event => predicateCtrlDown(event) || predicateCmdDown(event),
            getAbility: () => link(
              at<number>(1),
              focus.lastInColumn,
            )(focused.value),
          },
          {
            predicate: event => predicateCtrlRight(event) || predicateCmdRight(event),
            getAbility: () => link(
              at<number>(0),
              focus.lastInRow,
            )(focused.value),
          },
          {
            predicate: predicateUp,
            getAbility: () => focus.previousInColumn(focused.value),
          },
          {
            predicate: predicateLeft,
            getAbility: () => focus.previousInRow(focused.value),
          },
          {
            predicate: predicateDown,
            getAbility: () => focus.nextInColumn(focused.value),
          },
          {
            predicate: predicateRight,
            getAbility: () => focus.nextInRow(focused.value),
          },
          {
            predicate: event => predicateHome(event),
            getAbility: () => focus.first(),
          },
          {
            predicate: event => predicateEnd(event),
            getAbility: () => focus.last(),
          },
        ],
        multiselectAllDirectionalKeydownEffects: {
          predicate: (event: KeyboardEvent) => boolean,
          getNewPicksAndSuperselectedOmits: () => {
            newPicks: Coordinates[],
            superselectedOmits: Coordinates[]
          },
        }[] = [
          {
            predicate: event => predicateShiftCtrlUp(event) || predicateShiftCmdUp(event),
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    newPicks = (() => {
                      const newPicks: Coordinates[] = []

                      console.log({ minRow, minColumn, maxColumn, focused: focused.value })
                      if (predicateTopLeft(focused.value)) {
                        for (let row = minRow - 1; row >= 0; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            newPicks.push([row, column])
                          }
                        }

                        return newPicks
                      }

                      if (predicateTopRight(focused.value)) {
                        for (let row = minRow - 1; row >= 0; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            newPicks.push([row, column])
                          }
                        }

                        return newPicks
                      }

                      for (let row = focused.value[0]; row >= 0; row--) {
                        newPicks.push([row, focused.value[1]])
                      }

                      return newPicks
                    })(),
                    superselectedOmits = (predicateTopLeft(focused.value) || predicateTopRight(focused.value))
                      ? superselected.value
                      : []

              return { newPicks, superselectedOmits }
            },
          },
          {
            predicate: event => predicateShiftCtrlLeft(event) || predicateShiftCmdLeft(event),
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds()

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  switch (focused.value[0]) {
                    // case maxRow:
                    //   for (let column = minColumn - 1; column >= 0; column--) {
                    //     for (let row = minRow; row <= maxRow; row++) {
                    //       newPicks.push([row, column])
                    //     }
                    //   }

                    //   break
                    // case minRow:
                    //   for (let column = minColumn - 1; column >= 0; column--) {
                    //     for (let row = maxRow; row >= minRow; row--) {
                    //       newPicks.push([row, column])
                    //     }
                    //   }

                    //   break
                    default:
                      for (let column = focused.value[1]; column >= 0; column--) {
                        newPicks.push([focused.value[0], column])
                      }

                      break
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (focused.value[1] === maxColumn) {
                    for (let column = maxColumn; column > minColumn; column--) {
                      for (let row = maxRow; row >= minRow; row++) {
                        superselectedOmits.push([row, column])
                      }
                    }
                  }

                  return superselectedOmits
                })(),
              }
            },
          },
          {
            predicate: event => predicateShiftCtrlDown(event) || predicateShiftCmdDown(event),
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds()

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  switch (focused.value[1]) {
                    // case maxColumn:
                    //   for (let row = maxRow + 1; row < selectedRows.array.length; row++) {
                    //     for (let column = minColumn; column <= maxColumn; column++) {
                    //       newPicks.push([row, column])
                    //     }
                    //   }

                    //   break
                    // case minColumn:
                    //   for (let row = maxRow + 1; row < selectedRows.array.length; row++) {
                    //     for (let column = maxColumn; column >= minColumn; column--) {
                    //       newPicks.push([row, column])
                    //     }
                    //   }

                    //   break
                    default:
                      for (let row = focused.value[0]; row < selectedRows.array.length; row++) {
                        newPicks.push([row, focused.value[1]])
                      }

                      break
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (
                    !createCoordinatesEqual([minRow, minColumn])(focused.value)
                    && !createCoordinatesEqual([minRow, maxColumn])(focused.value)
                    && !createCoordinatesEqual([maxRow, minColumn])(focused.value)
                    && !createCoordinatesEqual([maxRow, maxColumn])(focused.value)
                  ) {
                    superselectedOmits.push(...superselected.value)
                    return superselectedOmits
                  }

                  if (focused.value[0] === minRow) {
                    for (let row = minRow; row < maxRow; row++) {
                      for (let column = minColumn; column <= maxColumn; column++) {
                        superselectedOmits.push([row, column])
                      }
                    }
                  }

                  return superselectedOmits
                })(),
              }
            },
          },
          {
            predicate: event => predicateShiftCtrlRight(event) || predicateShiftCmdRight(event),
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds()

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  switch (focused.value[0]) {
                    // case maxRow:
                    //   for (let column = maxColumn + 1; column < selectedColumns.array.length; column++) {
                    //     for (let row = minRow; row <= maxRow; row++) {
                    //       newPicks.push([row, column])
                    //     }
                    //   }

                    //   break
                    // case minRow:
                    //   for (let column = maxColumn + 1; column < selectedColumns.array.length; column++) {
                    //     for (let row = maxRow; row >= minRow; row--) {
                    //       newPicks.push([row, column])
                    //     }
                    //   }

                    //   break
                    default:
                      for (let column = focused.value[1]; column < selectedColumns.array.length; column++) {
                        newPicks.push([focused.value[0], column])
                      }

                      break
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (focused.value[1] === minColumn) {
                    for (let column = minColumn; column < maxColumn; column++) {
                      for (let row = minRow; row <= maxRow; row++) {
                        superselectedOmits.push([row, column])
                      }
                    }
                  }

                  return superselectedOmits
                })(),
              }
            },
          },
          {
            predicate: predicateShiftUp,
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    previousEligible = toPreviousEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'vertical',
                    })

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  if (previousEligible === 'none') return newPicks

                  if (focused.value[0] === minRow) {
                    switch (focused.value[1]) {
                      case maxColumn:
                        for (let row = minRow - 1; row >= previousEligible[0]; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                      case minColumn:
                        for (let row = minRow - 1; row >= previousEligible[0]; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                    }
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (previousEligible === 'none') return superselectedOmits

                  if (focused.value[0] === maxRow) {
                    for (let column = maxColumn; column >= minColumn; column--) {
                      superselectedOmits.push([maxRow, column])
                    }
                  }

                  return superselectedOmits
                })(),
              }

            },
          },
          {
            predicate: predicateShiftLeft,
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    previousEligible = toPreviousEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'horizontal',
                    })

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  if (previousEligible === 'none') return newPicks

                  if (focused.value[1] === minColumn) {
                    switch (focused.value[0]) {
                      case maxRow:
                        for (let column = minColumn - 1; column >= previousEligible[1]; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                      case minRow:
                        for (let column = minColumn - 1; column >= previousEligible[1]; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                    }
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (previousEligible === 'none') return superselectedOmits

                  if (focused.value[1] === maxColumn) {
                    for (let row = maxRow; row >= minRow; row--) {
                      superselectedOmits.push([row, maxColumn])
                    }
                  }

                  return superselectedOmits
                })(),
              }
            },
          },
          {
            predicate: predicateShiftDown,
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    nextEligible = toNextEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'vertical',
                    })

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  if (nextEligible === 'none') return newPicks

                  if (focused.value[0] === maxRow) {
                    switch (focused.value[1]) {
                      case maxColumn:
                        for (let row = maxRow + 1; row < nextEligible[0]; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                      case minColumn:
                        for (let row = maxRow + 1; row < nextEligible[0]; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                      default:
                        for (let row = focused.value[0]; row < nextEligible[0]; row++) {
                          newPicks.push([row, focused.value[1]])
                        }

                        break
                    }
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (focused.value[0] === minRow) {
                    for (let column = minColumn; column <= maxColumn; column++) {
                      superselectedOmits.push([minRow, column])
                    }
                  }

                  return superselectedOmits
                })(),
              }
            },
          },
          {
            predicate: predicateShiftRight,
            getNewPicksAndSuperselectedOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    nextEligible = toNextEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'horizontal',
                    })

              return {
                newPicks: (() => {
                  const newPicks: Coordinates[] = []

                  if (nextEligible === 'none') return newPicks

                  if (focused.value[1] === maxColumn) {
                    switch (focused.value[0]) {
                      case maxRow:
                        for (let column = maxColumn + 1; column < nextEligible[1]; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                      case minRow:
                        for (let column = maxColumn + 1; column < nextEligible[1]; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            newPicks.push([row, column])
                          }
                        }

                        break
                    }
                  }

                  return newPicks
                })(),
                superselectedOmits: (() => {
                  const superselectedOmits: Coordinates[] = []

                  if (focused.value[1] === minColumn) {
                    for (let row = minRow; row <= maxRow; row++) {
                      superselectedOmits.push([row, minColumn])
                    }
                  }

                  return superselectedOmits
                })(),
              }
            },
          },
        ]

  on(
    keyboardElement,
    {
      keydown: event => {
        maybeNullifySuperselectedStartIndex(event)

        for (const { predicate, getAbility } of singleselectKeydownEffects) {
          if (!predicate(event)) continue

          event.preventDefault()

          const a = getAbility()
          if (status.value === 'selecting') selectOnFocus(a)

          return
        }

        if (clears && predicateEsc(event)) {
          event.preventDefault()
          deselect.all()
          return
        }

        if (!multiselectable) return

        for (const { predicate, getNewPicksAndSuperselectedOmits } of multiselectAllDirectionalKeydownEffects) {
          if (!predicate(event)) continue

          event.preventDefault()

          const { newPicks, superselectedOmits } = getNewPicksAndSuperselectedOmits()

          const omitIndices: number[] = []
          for (let pickIndex = superselectedStartIndex.value; pickIndex < selectedRows.picks.length; pickIndex++) {
            const predicateEqual = createCoordinatesEqual([
              selectedRows.picks[pickIndex],
              selectedColumns.picks[pickIndex],
            ])

            if (!find<Coordinates>(predicateEqual)(superselectedOmits)) continue

            omitIndices.push(pickIndex)
          }


          selectedRows.omit(omitIndices, { reference: 'picks' })
          selectedColumns.omit(omitIndices, { reference: 'picks' })

          if (!newPicks.length) return

          ;(select as PlaneFeatures<true>['select']).exact(newPicks)
          superselectedStartIndex.value = selectedRows.picks.length - 1

          preventSelect()
          link(
            at<Coordinates>(-1),
            focus.exact,
          )(newPicks)
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
          focus.exact([selectedRows.first, selectedColumns.first])
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
        pressed = ref<Coordinates>([-1, -1]),
        released = ref<Coordinates>([-1, -1])

  // TODO: skip work for non-multiselectable?
  watch(
    [withPointerPress.press, withKeyboardPress.press],
    (current, previous) => {
      const [currentPointerPress, currentKeyboardPress] = current,
            [previousPointerPress] = previous || [],
            changedPress = currentPointerPress === previousPointerPress
              ? currentKeyboardPress
              : currentPointerPress

      press.value = changedPress
      pressed.value = getCoordinatesFromPressOrRelease(changedPress) || [-1, -1]
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
      released.value = getCoordinatesFromPressOrRelease(changedRelease) || [-1, -1]
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

  if (multiselectable) {
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
  }

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
  function createPointerPressEffect<EventType extends MouseEvent | TouchEvent> (
    { toClientX, toClientY }: {
      toClientX: (event: EventType) => number,
      toClientY: (event: EventType) => number
    }
  ) {
    return () => {
      const { event: firstEvent, coordinates: firstCoordinates, target: firstTarget } = (() => {
              let index = 0,
                  event: EventType,
                  coordinates: Coordinates | undefined,
                  target: HTMLElement | undefined

              while (index < withPointerPress.press.value.sequence.length) {
                const eventCandidate = withPointerPress.press.value.sequence.at(index) as EventType,
                      candidate = getTargetAndCoordinates(toClientX(eventCandidate), toClientY(eventCandidate))

                if (candidate.coordinates) {
                  event = eventCandidate
                  coordinates = candidate.coordinates
                  target = candidate.target
                  break
                }

                index++
              }

              return { event, coordinates, target }
            })(),
            { event: lastEvent, coordinates: lastCoordinates, target: lastTarget } = (() => {
              let index = withPointerPress.press.value.sequence.length - 1,
                  event: EventType,
                  coordinates: Coordinates | undefined,
                  target: HTMLElement | undefined

              while (index >= 0) {
                const eventCandidate = withPointerPress.press.value.sequence.at(index) as EventType,
                      candidate = getTargetAndCoordinates(toClientX(eventCandidate), toClientY(eventCandidate))

                if (candidate.coordinates) {
                  event = eventCandidate
                  coordinates = candidate.coordinates
                  target = candidate.target
                  break
                }

                index--
              }

              return { event, coordinates, target }
            })()

      pressIsSelecting = firstTarget !== lastTarget

      if (!pressIsSelecting) return

      if (!firstCoordinates || !lastCoordinates) return

      lastEvent.preventDefault()

      const newPicks = toPickRange({ firstCoordinates, lastCoordinates })

      maybeNullifySuperselectedStartIndex(firstEvent)
      maybeEstablishSuperselectedStartIndex(firstEvent)

      if (newPicks.length === 0) return

      preventSelect()
      focus.exact(at<Coordinates>(-1)(newPicks) as Coordinates)
      ;(select as PlaneFeatures<true>['select']).exact(newPicks)
      nextTick(allowSelect)
    }
  }

  const mousepressEffect = createPointerPressEffect<MouseEvent>({
          toClientX: event => event.clientX,
          toClientY: event => event.clientY,
        }),
        touchpressEffect = createPointerPressEffect<TouchEvent>({
          toClientX: event => event.touches[0].clientX,
          toClientY: event => event.touches[0].clientY,
        })

  function createPointerReleaseEffect<EventType extends MouseEvent | TouchEvent> (
    { toClientX, toClientY }: {
      toClientX: (event: EventType) => number,
      toClientY: (event: EventType) => number
    }
  ) {
    return () => {
      if (pressIsSelecting) {
        pressIsSelecting = false
        return
      }

      const event = withPointerPress.release.value.sequence.at(-1) as EventType,
            { coordinates } = getTargetAndCoordinates(toClientX(event), toClientY(event))

      if (!coordinates || !createCoordinatesEqual(pressed.value)(coordinates)) return // TODO Why am i checking coordinates equal?

      event.preventDefault()

      if (multiselectable) {
        if (event.shiftKey) {
          const newPicks = toPickRange({
            firstCoordinates: [selectedRows.oldest, selectedColumns.oldest],
            lastCoordinates: coordinates,
          })

          if (newPicks.length === 0) return

          preventSelect()
          focus.exact(at<Coordinates>(-1)(newPicks) as Coordinates)
          ;(select as PlaneFeatures<true>['select']).exact(newPicks)
          nextTick(allowSelect)
        }

        if (event.ctrlKey || event.metaKey) {
          preventSelect()
          focus.exact(coordinates)
          select.exact(coordinates)
          nextTick(allowSelect)

          return
        }
      }

      focus.exact(coordinates)

      if (predicateSelected(coordinates)) {
        if (clears || selectedRows.picks.length > 1) {
          deselect.exact(coordinates)
        }

        return
      }

      if (multiselectable && status.value === 'selecting') {
        ;(select as PlaneFeatures<true>['select']).exact(coordinates)
        return
      }

      ;(select as PlaneFeatures<true>['select']).exact(coordinates, { replace: 'all' })
    }

  }

  const mousereleaseEffect = createPointerReleaseEffect<MouseEvent>({
          toClientX: event => event.clientX,
          toClientY: event => event.clientY,
        }),
        touchreleaseEffect = createPointerReleaseEffect<TouchEvent>({
          toClientX: event => event.changedTouches[0].clientX,
          toClientY: event => event.changedTouches[0].clientY,
        })

  // TODO: don't use keyrelease, it's more frustrating than keydown
  function keyreleaseEffect () {
    if (status.value === 'selecting' || !selectedRows.array.length) return

    const event = withKeyboardPress.release.value.sequence.at(-1) as KeyboardEvent

    if (query.value && predicateSpace(event)) return

    event.preventDefault()

    if (predicateSelected(focused.value)) {
      if (clears || selectedRows.picks.length > 1) deselect.exact(focused.value)
      return
    }

    if (multiselectable) {
      ;(select as PlaneFeatures<true>['select']).exact(focused.value, { replace: 'none' })
      return
    }

    select.exact(focused.value)
  }

  const getTargetAndCoordinates: (x: number, y: number) => { target?: HTMLElement, coordinates?: Coordinates } = (x, y) => {
          for (const element of document.elementsFromPoint(x, y)) {
            const [row, column] = getCoordinates(element.id)
            if (row === -1) continue
            return { target: element as HTMLElement, coordinates: [row, column] }
          }

          return {}
        },
        selectOnFocus = (a: Ability | 'none') => {
          switch (a) {
            case 'disabled':
              selectedRows.omit()
              selectedColumns.omit()
              break
            case 'enabled':
              // Do nothing, handled by watch
            case 'none':
              // Do nothing
          }
        },
        getCoordinatesFromPressOrRelease = (pressOrRelease: Press | Release) => {
          switch (pressOrRelease.pointerType) {
            case 'mouse': {
              const event = pressOrRelease.sequence.at(-1) as MouseEvent
              const { coordinates } = getTargetAndCoordinates(event.clientX, event.clientY)
              return coordinates
            }
            case 'touch': {
              const event = pressOrRelease.sequence.at(-1) as TouchEvent
              if (!event.touches.length) return
              const { coordinates } = getTargetAndCoordinates(event.touches[0].clientX, event.touches[0].clientY)
              return coordinates
            }
            case 'keyboard': {
              return focused.value
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
      pressed: coordinates => createCoordinatesEqual(pressed.value)(coordinates),
      released: coordinates => createCoordinatesEqual(released.value)(coordinates),
    },
  }
}

const predicateCtrlUp = createKeycomboMatch('ctrl+up')
const predicateCmdUp = createKeycomboMatch('cmd+up')
const predicateCtrlLeft = createKeycomboMatch('ctrl+left')
const predicateCmdLeft = createKeycomboMatch('cmd+left')
const predicateCtrlDown = createKeycomboMatch('ctrl+down')
const predicateCmdDown = createKeycomboMatch('cmd+down')
const predicateCtrlRight = createKeycomboMatch('ctrl+right')
const predicateCmdRight = createKeycomboMatch('cmd+right')
const predicateShiftCtrlUp = createKeycomboMatch('shift+ctrl+up')
const predicateShiftCmdUp = createKeycomboMatch('shift+cmd+up')
const predicateShiftCtrlLeft = createKeycomboMatch('shift+ctrl+left')
const predicateShiftCmdLeft = createKeycomboMatch('shift+cmd+left')
const predicateShiftCtrlDown = createKeycomboMatch('shift+ctrl+down')
const predicateShiftCmdDown = createKeycomboMatch('shift+cmd+down')
const predicateShiftCtrlRight = createKeycomboMatch('shift+ctrl+right')
const predicateShiftCmdRight = createKeycomboMatch('shift+cmd+right')
const predicateShiftUp = createKeycomboMatch('shift+up')
const predicateShiftLeft = createKeycomboMatch('shift+left')
const predicateShiftDown = createKeycomboMatch('shift+down')
const predicateShiftRight = createKeycomboMatch('shift+right')

function toPickRange ({ firstCoordinates, lastCoordinates }: { firstCoordinates: Coordinates, lastCoordinates: Coordinates }) {
  const range: Coordinates[] = [],
        direction = (() => {
          if (firstCoordinates[0] < lastCoordinates[0] && firstCoordinates[1] === lastCoordinates[1]) return 'up'
          if (firstCoordinates[0] < lastCoordinates[0] && firstCoordinates[1] < lastCoordinates[1]) return 'up right'
          if (firstCoordinates[0] === lastCoordinates[0] && firstCoordinates[1] < lastCoordinates[1]) return 'right'
          if (firstCoordinates[0] > lastCoordinates[0] && firstCoordinates[1] < lastCoordinates[1]) return 'down right'
          if (firstCoordinates[0] > lastCoordinates[0] && firstCoordinates[1] === lastCoordinates[1]) return 'down'
          if (firstCoordinates[0] > lastCoordinates[0] && firstCoordinates[1] > lastCoordinates[1]) return 'down left'
          if (firstCoordinates[0] === lastCoordinates[0] && firstCoordinates[1] > lastCoordinates[1]) return 'left'
          return 'up left'
        })()

  switch (direction) {
    case 'up':
      for (let row = firstCoordinates[0]; row >= lastCoordinates[0]; row--) {
        range.push([row, firstCoordinates[1]])
      }

      break
    case 'up right':
      for (let row = firstCoordinates[0]; row >= lastCoordinates[0]; row--) {
        for (let column = firstCoordinates[1]; column <= lastCoordinates[1]; column++) {
          range.push([row, column])
        }
      }

      break
    case 'right':
      for (let column = firstCoordinates[1]; column <= lastCoordinates[1]; column++) {
        range.push([firstCoordinates[0], column])
      }

      break
    case 'down right':

  }

  return range
}
