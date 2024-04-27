import { ref, shallowRef, watch, computed, nextTick } from 'vue'
import type { Ref } from 'vue'
import {
  at,
  map,
  min,
  max,
  pipe as chain,
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
  predicateEnter,
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
  selected,
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
  keyboardElement: ElementApi<HTMLElement, true>['element'],
  pointerElement: ElementApi<HTMLElement, true>['element'],
  getCoordinates: (id: string) => Coordinates,
  focused: PlaneFeatures<Multiselectable>['focused'],
  selectedRows: PlaneFeatures<Multiselectable>['selectedRows'],
  selectedColumns: PlaneFeatures<Multiselectable>['selectedColumns'],
  selected: PlaneFeatures<Multiselectable>['selected'],
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
            getAbility: () => chain(
              at<number>(1),
              focus.firstInColumn,
            )(focused.value),
          },
          {
            predicate: event => predicateCtrlLeft(event) || predicateCmdLeft(event),
            getAbility: () => chain(
              at<number>(0),
              focus.firstInRow,
            )(focused.value),
          },
          {
            predicate: event => predicateCtrlDown(event) || predicateCmdDown(event),
            getAbility: () => chain(
              at<number>(1),
              focus.lastInColumn,
            )(focused.value),
          },
          {
            predicate: event => predicateCtrlRight(event) || predicateCmdRight(event),
            getAbility: () => chain(
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
        multiselectDirectionalKeydownEffects: {
          predicate: (event: KeyboardEvent) => boolean,
          getPicksAndOmits: () => {
            picks: Coordinates[],
            omits: Coordinates[],
          },
        }[] = [
          {
            predicate: event => predicateShiftCtrlUp(event) || predicateShiftCmdUp(event),
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateTopLeft(focused.value)
                        || predicateBottomLeft(focused.value)
                      ) {
                        for (let row = minRow - 1; row >= 0; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (
                        predicateTopRight(focused.value)
                        || predicateBottomRight(focused.value)
                      ) {
                        for (let row = minRow - 1; row >= 0; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      for (let row = focused.value[0]; row >= 0; row--) {
                        picks.push([row, focused.value[1]])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateBottomLeft(focused.value)) {
                        for (let row = maxRow; row > minRow; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateBottomRight(focused.value)) {
                        for (let row = maxRow; row > minRow; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: event => predicateShiftCtrlLeft(event) || predicateShiftCmdLeft(event),
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateBottomLeft(focused.value)
                        || predicateBottomRight(focused.value)
                      ) {
                        for (let column = minColumn - 1; column >= 0; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (
                        predicateTopLeft(focused.value)
                        || predicateTopRight(focused.value)
                      ) {
                        for (let column = minColumn - 1; column >= 0; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      for (let column = focused.value[1]; column >= 0; column--) {
                        picks.push([focused.value[0], column])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateBottomRight(focused.value)) {
                        for (let column = maxColumn; column > minColumn; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateTopRight(focused.value)) {
                        for (let column = maxColumn; column > minColumn; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: event => predicateShiftCtrlDown(event) || predicateShiftCmdDown(event),
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateBottomRight(focused.value)
                        || predicateTopRight(focused.value)
                      ) {
                        for (let row = maxRow + 1; row < selectedRows.array.length; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (
                        predicateBottomLeft(focused.value)
                        || predicateTopLeft(focused.value)
                      ) {
                        for (let row = maxRow + 1; row < selectedRows.array.length; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      for (let row = focused.value[0]; row < selectedRows.array.length; row++) {
                        picks.push([row, focused.value[1]])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateTopRight(focused.value)) {
                        for (let row = minRow; row < maxRow; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateTopLeft(focused.value)) {
                        for (let row = minRow; row < maxRow; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: event => predicateShiftCtrlRight(event) || predicateShiftCmdRight(event),
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateTopRight(focused.value)
                        || predicateTopLeft(focused.value)
                      ) {
                        for (let column = maxColumn + 1; column < selectedColumns.array.length; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (
                        predicateBottomRight(focused.value)
                        || predicateBottomLeft(focused.value)
                      ) {
                        for (let column = maxColumn + 1; column < selectedColumns.array.length; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      for (let column = focused.value[1]; column < selectedColumns.array.length; column++) {
                        picks.push([focused.value[0], column])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateTopLeft(focused.value)) {
                        for (let column = minColumn; column < maxColumn; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateBottomLeft(focused.value)) {
                        for (let column = minColumn; column < maxColumn; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: predicateShiftUp,
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    previousEligible = toPreviousEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'vertical',
                    }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (previousEligible === 'none') return picks

                      if (predicateTopLeft(focused.value)) {
                        for (let row = minRow - 1; row >= previousEligible[0]; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateTopRight(focused.value)) {
                        for (let row = minRow - 1; row >= previousEligible[0]; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateBottomLeft(focused.value) || predicateBottomRight(focused.value)) {
                        return picks
                      }

                      for (let row = focused.value[0]; row >= previousEligible[0]; row--) {
                        picks.push([row, focused.value[1]])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (previousEligible === 'none') return omits

                      if (predicateBottomLeft(focused.value) && !predicateTopLeft(focused.value)) {
                        for (let row = maxRow; row > previousEligible[0]; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateBottomRight(focused.value) && !predicateTopRight(focused.value)) {
                        for (let row = maxRow; row > previousEligible[0]; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: predicateShiftLeft,
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    previousEligible = toPreviousEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'horizontal',
                    }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (previousEligible === 'none') return picks

                      if (predicateBottomLeft(focused.value)) {
                        for (let column = minColumn - 1; column >= previousEligible[1]; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateTopLeft(focused.value)) {
                        for (let column = minColumn - 1; column >= previousEligible[1]; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateBottomRight(focused.value) || predicateTopRight(focused.value)) {
                        return picks
                      }

                      for (let column = focused.value[1]; column >= previousEligible[1]; column--) {
                        picks.push([focused.value[0], column])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (previousEligible === 'none') return omits

                      if (predicateBottomRight(focused.value) && !predicateBottomLeft(focused.value)) {
                        for (let column = maxColumn; column > previousEligible[1]; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateTopRight(focused.value) && !predicateTopLeft(focused.value)) {
                        for (let column = maxColumn; column > previousEligible[1]; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: predicateShiftDown,
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    nextEligible = toNextEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'vertical',
                    }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (nextEligible === 'none') return picks

                      if (predicateBottomRight(focused.value)) {
                        for (let row = maxRow + 1; row <= nextEligible[0]; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateBottomLeft(focused.value)) {
                        for (let row = maxRow + 1; row <= nextEligible[0]; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateTopRight(focused.value) || predicateTopLeft(focused.value)) {
                        return picks
                      }

                      for (let row = focused.value[0]; row <= nextEligible[0]; row++) {
                        picks.push([row, focused.value[1]])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (nextEligible === 'none') return omits

                      if (predicateTopRight(focused.value) && !predicateBottomRight(focused.value)) {
                        for (let row = minRow; row < nextEligible[0]; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push([row, column])
                          }
                        }
                      }

                      if (predicateTopLeft(focused.value) && !predicateBottomLeft(focused.value)) {
                        for (let row = minRow; row < nextEligible[0]; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push([row, column])
                          }
                        }
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
          {
            predicate: predicateShiftRight,
            getPicksAndOmits: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopRight = createCoordinatesEqual([minRow, maxColumn]),
                    predicateBottomRight = createCoordinatesEqual([maxRow, maxColumn]),
                    predicateTopLeft = createCoordinatesEqual([minRow, minColumn]),
                    predicateBottomLeft = createCoordinatesEqual([maxRow, minColumn]),
                    nextEligible = toNextEligible({
                      coordinates: focused.value,
                      toEligibility,
                      loops: false,
                      direction: 'horizontal',
                    }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (nextEligible === 'none') return picks

                      if (predicateTopRight(focused.value)) {
                        for (let column = maxColumn + 1; column <= nextEligible[1]; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateBottomRight(focused.value)) {
                        for (let column = maxColumn + 1; column <= nextEligible[1]; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push([row, column])
                          }
                        }

                        return picks
                      }

                      if (predicateTopLeft(focused.value) || predicateBottomLeft(focused.value)) {
                        return picks
                      }

                      for (let column = focused.value[1]; column <= nextEligible[1]; column++) {
                        picks.push([focused.value[0], column])
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (nextEligible === 'none') return omits

                      if (predicateTopLeft(focused.value) && !predicateTopRight(focused.value)) {
                        for (let column = minColumn; column < nextEligible[1]; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      if (predicateBottomLeft(focused.value) && !predicateBottomRight(focused.value)) {
                        for (let column = minColumn; column < nextEligible[1]; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push([row, column])
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
          },
        ]

  on(
    keyboardElement,
    {
      keydown: event => {
        if (predicateSpace(event) || predicateEnter(event)) {
          if (
            event.repeat
            || (query.value && predicateSpace(event))
          ) return

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

          return
        }

        for (const { predicate, getAbility } of singleselectKeydownEffects) {
          if (!predicate(event)) continue

          event.preventDefault()

          const a = getAbility()
          if (status.value === 'selecting') selectOnFocus(a)

          superselectedStartIndex.value = selectedRows.picks.length

          return
        }

        if (clears && predicateEsc(event)) {
          event.preventDefault()
          deselect.all()
          return
        }

        if (!multiselectable) return

        for (const { predicate, getPicksAndOmits } of multiselectDirectionalKeydownEffects) {
          if (!predicate(event)) continue

          event.preventDefault()

          const {
            picks,
            omits,
          } = getPicksAndOmits()

          const omitIndices: number[] = []
          for (let pickIndex = superselectedStartIndex.value; pickIndex < selectedRows.picks.length; pickIndex++) {
            const predicateEqual = createCoordinatesEqual([
              selectedRows.picks[pickIndex],
              selectedColumns.picks[pickIndex],
            ])

            if (!find<Coordinates>(predicateEqual)(omits)) continue

            omitIndices.push(pickIndex)
          }

          if (omitIndices.length) {
            selectedRows.omit(omitIndices, { reference: 'picks' })
            selectedColumns.omit(omitIndices, { reference: 'picks' })
          }

          if (picks.length) {
            ;(select as PlaneFeatures<true>['select']).exact(picks, { replace: 'none' })
          }

          preventSelect()
          chain(
            at<Coordinates>(-1),
            focus.exact,
          )(selected.value)
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

  let pressIsSelecting = false
  let pressSuperselectedStartIndexIsEstablished = false
  function createPointerPressEffect<EventType extends MouseEvent | TouchEvent> (
    { toClientX, toClientY }: {
      toClientX: (event: EventType) => number,
      toClientY: (event: EventType) => number
    }
  ) {
    return () => {
      const { event: firstEvent, coordinates: firstCoordinates } = (() => {
              let index = 0,
                  event: EventType,
                  coordinates: Coordinates | undefined

              while (index < withPointerPress.press.value.sequence.length) {
                const eventCandidate = withPointerPress.press.value.sequence.at(index) as EventType,
                      candidate = getTargetAndCoordinates(toClientX(eventCandidate), toClientY(eventCandidate))

                if (candidate.coordinates) {
                  event = eventCandidate
                  coordinates = candidate.coordinates
                  break
                }

                index++
              }

              return { event, coordinates }
            })(),
            { event: lastEvent, coordinates: lastCoordinates } = (() => {
              let index = withPointerPress.press.value.sequence.length - 1,
                  event: EventType,
                  coordinates: Coordinates | undefined

              while (index >= 0) {
                const eventCandidate = withPointerPress.press.value.sequence.at(index) as EventType,
                      candidate = getTargetAndCoordinates(toClientX(eventCandidate), toClientY(eventCandidate))

                if (candidate.coordinates) {
                  event = eventCandidate
                  coordinates = candidate.coordinates
                  break
                }

                index--
              }

              return { event, coordinates }
            })()

      if (!firstCoordinates) return

      const firstCoordinatesAreLastCoordinates = createCoordinatesEqual(lastCoordinates)(firstCoordinates)

      if (
        firstCoordinatesAreLastCoordinates
        && !firstEvent.shiftKey
        && !firstEvent.metaKey
        && !firstEvent.ctrlKey
      ) return

      if (
        !pressIsSelecting
        && firstCoordinatesAreLastCoordinates
        && (
          firstEvent.shiftKey
          || firstEvent.metaKey
          || firstEvent.ctrlKey
        )
        && (
            (
            superselected.value.length
            && !createCoordinatesEqual(superselected.value[0])(firstCoordinates)
          )
          || (
            !superselected.value.length
            && !createCoordinatesEqual(focused.value)(firstCoordinates)
          )
        )
      ) {
        lastEvent.preventDefault()

        pressIsSelecting = true
        pressSuperselectedStartIndexIsEstablished = true

        if (firstEvent.shiftKey) {
          const start = superselected.value[0] || focused.value

          if (!superselected.value.length) superselectedStartIndex.value = 0
          pointerPick({ start, end: lastCoordinates })

          return
        }

        if (firstEvent.metaKey || firstEvent.ctrlKey) {
          if (!superselected.value.length) superselectedStartIndex.value = 0
          preventSelect()
          focus.exact(superselected.value[0] || lastCoordinates)
          ;(select as PlaneFeatures<true>['select']).exact(lastCoordinates)
          nextTick(allowSelect)
          return
        }

        return
      }

      if (firstCoordinatesAreLastCoordinates) return

      lastEvent.preventDefault()

      pressIsSelecting = true

      const start = pressSuperselectedStartIndexIsEstablished
        ? superselected.value[0]
        : firstCoordinates

      if (!pressSuperselectedStartIndexIsEstablished) {
        superselectedStartIndex.value = selectedRows.picks.length
        pressSuperselectedStartIndexIsEstablished = true
      }

      pointerPick({ start, end: lastCoordinates })
    }
  }

  const mousepressEffect = createPointerPressEffect<MouseEvent>({
          toClientX: event => event.clientX,
          toClientY: event => event.clientY,
        }),
        touchpressEffect = createPointerPressEffect<TouchEvent>({
          toClientX: event => event.touches[0].clientX,
          toClientY: event => event.touches[0].clientY,
        }),
        pointerPick = (range: { start: Coordinates, end: Coordinates }) => {
          const picks = toPointerPicks(range)

          if (picks.length === 0) return

          const omitIndices: number[] = []
          for (let index = superselectedStartIndex.value; index < selectedRows.picks.length; index++) {
            omitIndices.push(index)
          }

          if (omitIndices.length) {
            selectedRows.omit(omitIndices, { reference: 'picks' })
            selectedColumns.omit(omitIndices, { reference: 'picks' })
          }

          preventSelect()
          focus.exact(at<Coordinates>(0)(picks) as Coordinates)
          ;(select as PlaneFeatures<true>['select']).exact(picks)
          nextTick(allowSelect)
        }

  function createPointerReleaseEffect<EventType extends MouseEvent | TouchEvent> (
    { toClientX, toClientY }: {
      toClientX: (event: EventType) => number,
      toClientY: (event: EventType) => number
    }
  ) {
    return () => {
      if (pressIsSelecting) {
        pressIsSelecting = false
        pressSuperselectedStartIndexIsEstablished = false
        return
      }

      const event = withPointerPress.release.value.sequence.at(-1) as EventType,
            { coordinates } = getTargetAndCoordinates(toClientX(event), toClientY(event))

      if (!coordinates || !createCoordinatesEqual(pressed.value)(coordinates)) return // TODO Why am i checking coordinates equal?

      event.preventDefault()

      focus.exact(coordinates)

      if (predicateSelected(coordinates)) {
        if (!clears && !selectedRows.multiple) return

        deselect.exact(coordinates)
        return
      }

      preventSelect()
      focus.exact(coordinates)
      ;(select as PlaneFeatures<true>['select']).exact(
        coordinates,
        { replace: multiselectable ? 'none' : 'all' }
      )
      superselectedStartIndex.value = selectedRows.picks.length - 1
      nextTick(allowSelect)
      return
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

function toPointerPicks ({ start, end }: { start: Coordinates, end: Coordinates }) {
  const picks: Coordinates[] = [],
        direction = (() => {
          if (start[0] > end[0] && start[1] > end[1]) return 'up left'
          if (start[0] > end[0] && start[1] === end[1]) return 'up'
          if (start[0] > end[0] && start[1] < end[1]) return 'up right'
          if (start[0] === end[0] && start[1] < end[1]) return 'right'
          if (start[0] < end[0] && start[1] < end[1]) return 'down right'
          if (start[0] < end[0] && start[1] === end[1]) return 'down'
          if (start[0] < end[0] && start[1] > end[1]) return 'down left'
          return 'left'
        })()

  switch (direction) {
    case 'up left':
      for (let row = start[0]; row >= end[0]; row--) {
        for (let column = start[1]; column >= end[1]; column--) {
          picks.push([row, column])
        }
      }

      break
    case 'up':
      for (let row = start[0]; row >= end[0]; row--) {
        picks.push([row, start[1]])
      }

      break
    case 'up right':
      for (let row = start[0]; row >= end[0]; row--) {
        for (let column = start[1]; column <= end[1]; column++) {
          picks.push([row, column])
        }
      }

      break
    case 'right':
      for (let column = start[1]; column <= end[1]; column++) {
        picks.push([start[0], column])
      }

      break
    case 'down right':
      for (let row = start[0]; row <= end[0]; row++) {
        for (let column = start[1]; column <= end[1]; column++) {
          picks.push([row, column])
        }
      }

      break
    case 'down':
      for (let row = start[0]; row <= end[0]; row++) {
        picks.push([row, start[1]])
      }

      break
    case 'down left':
      for (let row = start[0]; row <= end[0]; row++) {
        for (let column = start[1]; column >= end[1]; column--) {
          picks.push([row, column])
        }
      }

      break
    case 'left':
      for (let column = start[1]; column >= end[1]; column--) {
        picks.push([start[0], column])
      }

      break
  }

  return picks
}
