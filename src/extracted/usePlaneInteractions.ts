import {
  ref,
  shallowRef,
  watch,
  computed,
  nextTick,
  type Ref,
} from 'vue'
import {
  at,
  map,
  min,
  max,
  pipe,
  find,
} from 'lazy-collections'
import { createKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import {
  type PressDescriptor,
  type Press,
  useHover,
  usePress,
} from '../extensions'
import {
  type Hover,
  type HoverDescriptor,
} from '../extensions/useHover'
import {
  type PlaneFeatures,
  type UsePlaneFeaturesConfig,
} from './usePlaneFeatures'
import { type ToEligible } from './createToEligibleInPlane'
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
import { type Ability } from './ability'
import { createCoordinatesEqual } from './createCoordinatesEqual'
import { type Coordinates } from './coordinates'
import { type SupportedElement } from './toRenderedKind'

export type PlaneInteractions = {
  pressed: Ref<Coordinates>,
  released: Ref<Coordinates>,
  pressDescriptor: Press['descriptor'],
  firstPressDescriptor: Press['firstDescriptor'],
  pressStatus: Press['status'],
  hovered: Ref<Coordinates>,
  hoverDescriptor: Hover['descriptor'],
  firstHoverDescriptor: Hover['firstDescriptor'],
  is: {
    pressed: (coordinates?: Coordinates) => boolean,
    released: (coordinates?: Coordinates) => boolean,
    hovered: (coordinates?: Coordinates) => boolean,
    exited: (coordinates?: Coordinates) => boolean,
  },
}

export function usePlaneInteractions<
  Multiselectable extends boolean = false,
  Clears extends boolean = true,
> ({
  keyboardTargetApi,
  pointerTargetApi,
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
  superselected,
  superselect,
  keyboardStatus,
  multiselectable,
  clears,
  toAbility,
  toNextEligible,
  toPreviousEligible,
}: {
  keyboardTargetApi: UsePlaneFeaturesConfig['keyboardTargetApi'],
  pointerTargetApi: UsePlaneFeaturesConfig['rootApi'],
  getCoordinates: (element: SupportedElement) => Coordinates,
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
  superselected: PlaneFeatures<Multiselectable>['superselected'],
  superselect: PlaneFeatures<Multiselectable>['superselect'],
  keyboardStatus: PlaneFeatures<Multiselectable>['keyboardStatus'],
  multiselectable: Multiselectable,
  clears: Clears,
  toAbility: (coordinates: Coordinates) => Ability,
  toNextEligible: ToEligible,
  toPreviousEligible: ToEligible,
}): PlaneInteractions {
  const toEligibility = (coordinates: Coordinates) => toAbility(coordinates) === 'enabled' ? 'eligible' : 'ineligible',
        getSuperselectedBounds = () => ({
          minRow: pipe<Coordinates[]>(
            map<Coordinates, number>(({ row }) => row),
            min(),
          )(superselected.value) as number,
          maxRow: pipe<Coordinates[]>(
            map<Coordinates, number>(({ row }) => row),
            max(),
          )(superselected.value) as number,
          minColumn: pipe<Coordinates[]>(
            map<Coordinates, number>(({ column }) => column),
            min(),
          )(superselected.value) as number,
          maxColumn: pipe<Coordinates[]>(
            map<Coordinates, number>(({ column }) => column),
            max(),
          )(superselected.value) as number,
        }),
        singleselectInteractions: {
          predicate: (descriptor: Parameters<ReturnType<typeof createKeycomboMatch>>[0]) => boolean,
          getAbility: () => Ability | 'none',
        }[] = [
          {
            predicate: descriptor => (
              selectedRows.array.length > 1
              && (
                predicateCtrlUp(descriptor)
                || predicateCmdUp(descriptor)
              )
            ),
            getAbility: () => focus.firstInColumn(focused.value.column),
          },
          {
            predicate: descriptor => (
              selectedColumns.array.length > 1
              && (
                predicateCtrlLeft(descriptor)
                || predicateCmdLeft(descriptor)
              )
            ),
            getAbility: () => focus.firstInRow(focused.value.row),
          },
          {
            predicate: descriptor => (
              selectedRows.array.length > 1
              && (
                predicateCtrlDown(descriptor)
                || predicateCmdDown(descriptor)
              )
            ),
            getAbility: () => focus.lastInColumn(focused.value.column),
          },
          {
            predicate: descriptor => (
              selectedColumns.array.length > 1
              && (
                predicateCtrlRight(descriptor)
                || predicateCmdRight(descriptor)
              )
            ),
            getAbility: () => focus.lastInRow(focused.value.row),
          },
          {
            predicate: descriptor => selectedRows.array.length > 1 && predicateUp(descriptor),
            getAbility: () => focus.previousInColumn(focused.value),
          },
          {
            predicate: descriptor => selectedColumns.array.length > 1 && predicateLeft(descriptor),
            getAbility: () => focus.previousInRow(focused.value),
          },
          {
            predicate: descriptor => selectedRows.array.length > 1 && predicateDown(descriptor),
            getAbility: () => focus.nextInColumn(focused.value),
          },
          {
            predicate: descriptor => selectedColumns.array.length > 1 && predicateRight(descriptor),
            getAbility: () => focus.nextInRow(focused.value),
          },
          {
            predicate: descriptor => predicateHome(descriptor),
            getAbility: () => focus.first(),
          },
          {
            predicate: descriptor => predicateEnd(descriptor),
            getAbility: () => focus.last(),
          },
        ],
        multiselectInteractions: {
          predicate: (descriptor: Parameters<ReturnType<typeof createKeycomboMatch>>[0]) => boolean,
          getChangeDescriptor: () => {
            picks: Coordinates[],
            omits: Coordinates[],
            focused?: Coordinates,
          },
          focuses: boolean,
        }[] = [
          {
            predicate: descriptor => (
              selectedRows.array.length > 1
              && (
                predicateShiftCtrlUp(descriptor)
                || predicateShiftCmdUp(descriptor)
              )
            ),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateTopLeft(focused.value)
                        || predicateBottomLeft(focused.value)
                      ) {
                        for (let row = minRow - 1; row >= 0; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push({ row, column })
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
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      for (let row = focused.value.row; row >= 0; row--) {
                        picks.push({ row, column: focused.value.column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateBottomLeft(focused.value)) {
                        for (let row = maxRow; row > minRow; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateBottomRight(focused.value)) {
                        for (let row = maxRow; row > minRow; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
            focuses: true,
          },
          {
            predicate: descriptor => (
              selectedColumns.array.length > 1
              && (
                predicateShiftCtrlLeft(descriptor)
                || predicateShiftCmdLeft(descriptor)
              )
            ),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateBottomLeft(focused.value)
                        || predicateBottomRight(focused.value)
                      ) {
                        for (let column = minColumn - 1; column >= 0; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push({ row, column })
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
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      for (let column = focused.value.column; column >= 0; column--) {
                        picks.push({ row: focused.value.row, column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateBottomRight(focused.value)) {
                        for (let column = maxColumn; column > minColumn; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateTopRight(focused.value)) {
                        for (let column = maxColumn; column > minColumn; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
            focuses: true,
          },
          {
            predicate: descriptor => (
              selectedRows.array.length > 1
              && (
                predicateShiftCtrlDown(descriptor)
                || predicateShiftCmdDown(descriptor)
              )
            ),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateBottomRight(focused.value)
                        || predicateTopRight(focused.value)
                      ) {
                        for (let row = maxRow + 1; row < selectedRows.array.length; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push({ row, column })
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
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      for (let row = focused.value.row; row < selectedRows.array.length; row++) {
                        picks.push({ row, column: focused.value.column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateTopRight(focused.value)) {
                        for (let row = minRow; row < maxRow; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateTopLeft(focused.value)) {
                        for (let row = minRow; row < maxRow; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
            focuses: true,
          },
          {
            predicate: descriptor => (
              selectedColumns.array.length > 1
              && (
                predicateShiftCtrlRight(descriptor)
                || predicateShiftCmdRight(descriptor)
              )
            ),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    picks = (() => {
                      const picks: Coordinates[] = []

                      if (
                        predicateTopRight(focused.value)
                        || predicateTopLeft(focused.value)
                      ) {
                        for (let column = maxColumn + 1; column < selectedColumns.array.length; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push({ row, column })
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
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      for (let column = focused.value.column; column < selectedColumns.array.length; column++) {
                        picks.push({ row: focused.value.row, column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (predicateTopLeft(focused.value)) {
                        for (let column = minColumn; column < maxColumn; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateBottomLeft(focused.value)) {
                        for (let column = minColumn; column < maxColumn; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return { picks, omits }
            },
            focuses: true,
          },
          {
            predicate: descriptor => selectedRows.array.length > 1 && predicateShiftUp(descriptor),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
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
                        for (let row = minRow - 1; row >= previousEligible.row; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateTopRight(focused.value)) {
                        for (let row = minRow - 1; row >= previousEligible.row; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateBottomLeft(focused.value) || predicateBottomRight(focused.value)) {
                        return picks
                      }

                      for (let row = focused.value.row; row >= previousEligible.row; row--) {
                        picks.push({ row, column: focused.value.column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (previousEligible === 'none') return omits

                      if (predicateBottomLeft(focused.value) && !predicateTopLeft(focused.value)) {
                        for (let row = maxRow; row > previousEligible.row; row--) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateBottomRight(focused.value) && !predicateTopRight(focused.value)) {
                        for (let row = maxRow; row > previousEligible.row; row--) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return {
                picks,
                omits,
                ...(
                  previousEligible === 'none'
                    ? {}
                    : { focused: previousEligible }
                ),
              }
            },
            focuses: true,
          },
          {
            predicate: descriptor => selectedColumns.array.length > 1 && predicateShiftLeft(descriptor),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
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
                        for (let column = minColumn - 1; column >= previousEligible.column; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateTopLeft(focused.value)) {
                        for (let column = minColumn - 1; column >= previousEligible.column; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateBottomRight(focused.value) || predicateTopRight(focused.value)) {
                        return picks
                      }

                      for (let column = focused.value.column; column >= previousEligible.column; column--) {
                        picks.push({ row: focused.value.row, column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (previousEligible === 'none') return omits

                      if (predicateBottomRight(focused.value) && !predicateBottomLeft(focused.value)) {
                        for (let column = maxColumn; column > previousEligible.column; column--) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateTopRight(focused.value) && !predicateTopLeft(focused.value)) {
                        for (let column = maxColumn; column > previousEligible.column; column--) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return {
                picks,
                omits,
                ...(
                  previousEligible === 'none'
                    ? {}
                    : { focused: previousEligible }
                ),
              }
            },
            focuses: true,
          },
          {
            predicate: descriptor => selectedRows.array.length > 1 && predicateShiftDown(descriptor),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
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
                        for (let row = maxRow + 1; row <= nextEligible.row; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateBottomLeft(focused.value)) {
                        for (let row = maxRow + 1; row <= nextEligible.row; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateTopRight(focused.value) || predicateTopLeft(focused.value)) {
                        return picks
                      }

                      for (let row = focused.value.row; row <= nextEligible.row; row++) {
                        picks.push({ row, column: focused.value.column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (nextEligible === 'none') return omits

                      if (predicateTopRight(focused.value) && !predicateBottomRight(focused.value)) {
                        for (let row = minRow; row < nextEligible.row; row++) {
                          for (let column = maxColumn; column >= minColumn; column--) {
                            omits.push({ row, column })
                          }
                        }
                      }

                      if (predicateTopLeft(focused.value) && !predicateBottomLeft(focused.value)) {
                        for (let row = minRow; row < nextEligible.row; row++) {
                          for (let column = minColumn; column <= maxColumn; column++) {
                            omits.push({ row, column })
                          }
                        }
                      }

                      return omits
                    })()

              return {
                picks,
                omits,
                ...(
                  nextEligible === 'none'
                    ? {}
                    : { focused: nextEligible }
                ),
              }
            },
            focuses: true,
          },
          {
            predicate: descriptor => selectedColumns.array.length > 1 && predicateShiftRight(descriptor),
            getChangeDescriptor: () => {
              const { minRow, maxRow, minColumn, maxColumn } = getSuperselectedBounds(),
                    predicateTopRight = createCoordinatesEqual({ row: minRow, column: maxColumn }),
                    predicateBottomRight = createCoordinatesEqual({ row: maxRow, column: maxColumn }),
                    predicateTopLeft = createCoordinatesEqual({ row: minRow, column: minColumn }),
                    predicateBottomLeft = createCoordinatesEqual({ row: maxRow, column: minColumn }),
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
                        for (let column = maxColumn + 1; column <= nextEligible.column; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateBottomRight(focused.value)) {
                        for (let column = maxColumn + 1; column <= nextEligible.column; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            picks.push({ row, column })
                          }
                        }

                        return picks
                      }

                      if (predicateTopLeft(focused.value) || predicateBottomLeft(focused.value)) {
                        return picks
                      }

                      for (let column = focused.value.column; column <= nextEligible.column; column++) {
                        picks.push({ row: focused.value.row, column })
                      }

                      return picks
                    })(),
                    omits = (() => {
                      const omits: Coordinates[] = []

                      if (nextEligible === 'none') return omits

                      if (predicateTopLeft(focused.value) && !predicateTopRight(focused.value)) {
                        for (let column = minColumn; column < nextEligible.column; column++) {
                          for (let row = minRow; row <= maxRow; row++) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      if (predicateBottomLeft(focused.value) && !predicateBottomRight(focused.value)) {
                        for (let column = minColumn; column < nextEligible.column; column++) {
                          for (let row = maxRow; row >= minRow; row--) {
                            omits.push({ row, column })
                          }
                        }

                        return omits
                      }

                      return omits
                    })()

              return {
                picks,
                omits,
                ...(
                  nextEligible === 'none'
                    ? {}
                    : { focused: nextEligible }
                ),
              }
            },
            focuses: true,
          },
          {
            predicate: predicateShiftSpace,
            getChangeDescriptor: () => {
              const picks = (() => {
                const picks: Coordinates[] = [focused.value],
                      predicateFocused = createCoordinatesEqual(focused.value)

                for (let column = 0; column < selectedColumns.array.length; column++) {
                  if (predicateFocused({ row: focused.value.row, column })) continue
                  picks.push({ row: focused.value.row, column })
                }

                return picks
              })()

              return { picks, omits: [] }
            },
            focuses: false,
          },
          {
            predicate: predicateCtrlSpace,
            getChangeDescriptor: () => {
              const picks = (() => {
                const picks: Coordinates[] = [focused.value],
                      predicateFocused = createCoordinatesEqual(focused.value)

                for (let row = 0; row < selectedRows.array.length; row++) {
                  if (predicateFocused({ row, column: focused.value.column })) continue
                  picks.push({ row, column: focused.value.column })
                }

                return picks
              })()

              return { picks, omits: [] }
            },
            focuses: false,
          },
        ],
        maybePreventDefault = (event: KeyboardEvent) => {
          if (keyboardTargetApi.element.value === pointerTargetApi.element.value) event.preventDefault()
        }

  on(
    keyboardTargetApi.element,
    {
      keydown: event => {
        if (keyboardTargetApi.meta.value.targetability === 'untargetable') return

        if (predicateSpace(event) || predicateEnter(event)) {
          if (
            event.repeat
            || (query.value && predicateSpace(event))
            || keyboardStatus.value !== 'focusing'
          ) return

          maybePreventDefault(event)

          if (predicateSelected(focused.value)) {
            if (clears || selectedRows.picks.length > 1) deselect.exact(focused.value)
            return
          }

          if (multiselectable) {
            ;(select as PlaneFeatures<true>['select']).exact(focused.value, { replace: 'none' })
            return
          }

          select.exact(focused.value, { replace: 'all' })

          return
        }

        const descriptor = {
          code: event.code,
          shiftKey: event.shiftKey && multiselectable,
          altKey: event.altKey,
          ctrlKey: (
            event.ctrlKey
            && (
              multiselectable
              || !predicateSpace({ code: event.code })
            )
          ),
          metaKey: event.metaKey,
        }

        for (const { predicate, getAbility } of singleselectInteractions) {
          if (!predicate(descriptor)) continue

          maybePreventDefault(event)

          const a = getAbility()
          if (keyboardStatus.value === 'selecting') selectOnFocus(a)

          superselect.from(selectedRows.picks.length)

          return
        }

        if (clears && predicateEsc(event)) {
          maybePreventDefault(event)
          deselect.all()
          return
        }

        for (const { predicate, getChangeDescriptor, focuses } of multiselectInteractions) {
          if (!predicate(descriptor)) continue

          maybePreventDefault(event)

          const {
            picks,
            omits,
            focused,
          } = getChangeDescriptor()

          const omitIndices: number[] = []
          for (let pickIndex = selected.value.length - superselected.value.length; pickIndex < selectedRows.picks.length; pickIndex++) {
            const predicateEqual = createCoordinatesEqual({
              row: selectedRows.picks[pickIndex],
              column: selectedColumns.picks[pickIndex],
            })

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


          if (focuses) {
            preventSelect()
            focus.exact(focused || selected.value.at(-1))
            nextTick(allowSelect)
          }

          return
        }

        if (
          multiselectable
          && (
            predicateCtrlA(event)
            || predicateCmdA(event)
          )
        ) {
          maybePreventDefault(event)

          const a = select.all()

          if (a !== 'enabled') return

          preventSelect()
          focus.exact({ row: selectedRows.first, column: selectedColumns.first })
          nextTick(allowSelect)

          return
        }
      },
    }
  )


  // PRESSING
  const pointerPress = usePress(
          pointerTargetApi.element,
          { keyboard: false },
        ),
        keyboardPress = usePress(
          keyboardTargetApi.element,
          {
            pointer: false,
            keyboard: { preventsDefaultUnlessDenied: false },
          }
        ),
        pressDescriptor = shallowRef(pointerPress.descriptor.value),
        firstPressDescriptor = shallowRef(pointerPress.firstDescriptor.value),
        pressStatus = shallowRef(pointerPress.status.value),
        pressed = ref<Coordinates>({ row: -1, column: -1 }),
        released = ref<Coordinates>({ row: -1, column: -1 })

  // TODO: skip work for non-multiselectable?
  watch(
    [pointerPress.descriptor, keyboardPress.descriptor],
    (current, previous) => {
      const [currentPointerDescriptor, currentKeyboardDescriptor] = current,
            [previousPointerDescriptor] = previous || [],
            changedDescriptor = currentPointerDescriptor === previousPointerDescriptor
              ? currentKeyboardDescriptor
              : currentPointerDescriptor

      pressDescriptor.value = changedDescriptor
      pressed.value = (
        getCoordinatesFromPressDescriptor(changedDescriptor)
        || { row: -1, column: -1 }
      )
    }
  )

  watch(
    [pointerPress.firstDescriptor, keyboardPress.firstDescriptor],
    (current, previous) => {
      const [currentPointerDescriptor, currentKeyboardDescriptor] = current,
            [previousPointerDescriptor] = previous || [],
            changedDescriptor = currentPointerDescriptor === previousPointerDescriptor
              ? currentKeyboardDescriptor
              : currentPointerDescriptor

      firstPressDescriptor.value = changedDescriptor
    }
  )

  watch(
    [pointerPress.status, keyboardPress.status],
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
      pointerPress.descriptor,
      () => pointerpressEffect(),
    )
  }

  watch(
    pointerPress.status,
    status => {
      if (status !== 'released') return
      pointerreleaseEffect()
    }
  )

  let pressIsSelecting = false
  let pressSuperselectedStartIndexIsEstablished = false

  const pointerpressEffect = () => {
          const { event: firstEvent, coordinates: firstCoordinates } = (() => {
                  let index = 0,
                      event: PointerEvent,
                      coordinates: Coordinates | undefined

                  while (index < pointerPress.descriptor.value.sequence.length) {
                    const eventCandidate = pointerPress.descriptor.value.sequence.at(index) as PointerEvent,
                          candidate = getTargetAndCoordinates({ x: eventCandidate.clientX, y: eventCandidate.clientY })

                    if (
                      candidate.coordinates
                      && eventCandidate.type !== 'pointerout'
                    ) {
                      event = eventCandidate
                      coordinates = candidate.coordinates
                      break
                    }

                    index++
                  }

                  return { event, coordinates }
                })(),
                { event: lastEvent, coordinates: lastCoordinates } = (() => {
                  let index = pointerPress.descriptor.value.sequence.length - 1,
                      event: PointerEvent,
                      coordinates: Coordinates | undefined

                  while (index >= 0) {
                    const eventCandidate = pointerPress.descriptor.value.sequence.at(index) as PointerEvent,
                          candidate = getTargetAndCoordinates({ x: eventCandidate.clientX, y: eventCandidate.clientY })

                    if (candidate.coordinates) {
                      event = eventCandidate
                      coordinates = candidate.coordinates
                      break
                    }

                    index--
                  }

                  return { event, coordinates }
                })()

          if (pointerTargetApi.meta.value.ability === 'disabled') {
            if (pointerPress.descriptor.value.kind !== 'touch') lastEvent.preventDefault()
            pressIsSelecting = false
            pressSuperselectedStartIndexIsEstablished = false
            return
          }

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
            if (pointerPress.descriptor.value.kind !== 'touch') lastEvent.preventDefault()

            pressIsSelecting = true
            pressSuperselectedStartIndexIsEstablished = true

            if (firstEvent.shiftKey) {
              const start = superselected.value[0] || focused.value

              superselect.from(0)
              pointerPick({ start, end: lastCoordinates })

              return
            }

            if (firstEvent.metaKey || firstEvent.ctrlKey) {
              superselect.from(0)
              preventSelect()
              focus.exact(superselected.value[0] || lastCoordinates)
              ;(select as PlaneFeatures<true>['select']).exact(lastCoordinates)
              nextTick(allowSelect)
              return
            }

            return
          }

          if (pointerPress.descriptor.value.kind !== 'touch') lastEvent.preventDefault()

          pressIsSelecting = true

          const start = pressSuperselectedStartIndexIsEstablished
            ? superselected.value[0]
            : firstCoordinates

          if (!pressSuperselectedStartIndexIsEstablished) {
            superselect.from(selectedRows.picks.length)
            pressSuperselectedStartIndexIsEstablished = true
          }

          pointerPick({ start, end: lastCoordinates })
        },
        pointerPick = (range: { start: Coordinates, end: Coordinates }) => {
          const picks = toPointerPicks(range)

          if (picks.length === 0) return

          const omitIndices: number[] = []
          for (let index = selected.value.length - superselected.value.length; index < selectedRows.picks.length; index++) {
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
        },
        pointerreleaseEffect = () => {
          if (pressIsSelecting) {
            pressIsSelecting = false
            pressSuperselectedStartIndexIsEstablished = false
            return
          }

          const event = pointerPress.descriptor.value.sequence.at(-1) as PointerEvent,
                { coordinates } = getTargetAndCoordinates({ x: event.clientX, y: event.clientY })

          if (
            !coordinates
            || !createCoordinatesEqual(pressed.value)(coordinates)
          ) return // TODO Why am i checking coordinates equal?

          if (pointerPress.descriptor.value.kind !== 'touch') event.preventDefault()

          if (pointerTargetApi.meta.value.ability === 'disabled') return

          if (predicateSelected(coordinates)) {
            if (!clears && !selectedRows.multiple) return

            preventSelect()
            focus.exact(coordinates)
            deselect.exact(coordinates)
            nextTick(allowSelect)
            return
          }

          preventSelect()
          focus.exact(coordinates)
          ;(select as PlaneFeatures<true>['select']).exact(
            coordinates,
            { replace: multiselectable ? 'none' : 'all' }
          )
          superselect.from(selectedRows.picks.length - 1)
          nextTick(allowSelect)
          return
        },
        getTargetAndCoordinates: ({ x, y }: { x: number, y: number }) => { target?: SupportedElement, coordinates?: Coordinates } = ({ x, y }) => {
          for (const element of document.elementsFromPoint(x, y)) {
            const { row, column } = getCoordinates(element as SupportedElement)
            if (row === -1) continue
            return { target: element as SupportedElement, coordinates: { row, column } }
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
        getCoordinatesFromPressDescriptor = (descriptor: PressDescriptor) => {
          switch (descriptor.kind) {
            case 'mouse':
            case 'touch':
              const event = descriptor.sequence.at(-1) as MouseEvent
              const { coordinates } = getTargetAndCoordinates({ x: event.clientX, y: event.clientY })
              return coordinates
            case 'keyboard':
              return focused.value
          }
        }


  // HOVER
  const hover = useHover(pointerTargetApi.element),
        hovered = ref<Coordinates>({ row: -1, column: -1 })

  watch(
    hover.descriptor,
    descriptor => hovered.value = (
      getCoordinatesFromHover(descriptor)
      || { row: -1, column: -1 }
    )
  )

  const getCoordinatesFromHover = (descriptor: HoverDescriptor) => {
    const { coordinates } = getTargetAndCoordinates(descriptor.metadata.points.end)
    return coordinates
  }


  return {
    pressed: computed(() => pressed.value),
    released: computed(() => released.value),
    pressDescriptor: computed(() => pressDescriptor.value),
    firstPressDescriptor: computed(() => firstPressDescriptor.value),
    pressStatus: computed(() => pressStatus.value),
    hovered: computed(() => hovered.value),
    hoverDescriptor: computed(() => hover.descriptor.value),
    firstHoverDescriptor: computed(() => hover.firstDescriptor.value),
    is: {
      pressed: coordinates => (
        !coordinates
          ? (pointerPress.is.pressed() || keyboardPress.is.pressed())
          : createCoordinatesEqual(pressed.value)(coordinates)
      ),
      released: coordinates => (
        !coordinates
          ? (pointerPress.is.released() && keyboardPress.is.released())
          : createCoordinatesEqual(released.value)(coordinates)
      ),
      hovered: coordinates => (
        !coordinates
          ? hover.is.hovered()
          : createCoordinatesEqual(hovered.value)(coordinates)
      ),
      exited: coordinates => (
        !coordinates
          ? hover.is.exited()
          : !createCoordinatesEqual(hovered.value)(coordinates)
      ),
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
const predicateShiftSpace = createKeycomboMatch('shift+space')
const predicateCtrlSpace = createKeycomboMatch('ctrl+space')
const predicateCtrlA = createKeycomboMatch('ctrl+a')
const predicateCmdA = createKeycomboMatch('cmd+a')

function toPointerPicks ({ start, end }: { start: Coordinates, end: Coordinates }) {
  const picks: Coordinates[] = [],
        direction = (() => {
          if (start.row > end.row && start.column > end.column) return 'up left'
          if (start.row > end.row && start.column === end.column) return 'up'
          if (start.row > end.row && start.column < end.column) return 'up right'
          if (start.row === end.row && start.column < end.column) return 'right'
          if (start.row < end.row && start.column < end.column) return 'down right'
          if (start.row < end.row && start.column === end.column) return 'down'
          if (start.row < end.row && start.column > end.column) return 'down left'
          return 'left'
        })()

  switch (direction) {
    case 'up left':
      for (let row = start.row; row >= end.row; row--) {
        for (let column = start.column; column >= end.column; column--) {
          picks.push({ row, column })
        }
      }

      break
    case 'up':
      for (let row = start.row; row >= end.row; row--) {
        picks.push({ row, column: start.column })
      }

      break
    case 'up right':
      for (let row = start.row; row >= end.row; row--) {
        for (let column = start.column; column <= end.column; column++) {
          picks.push({ row, column })
        }
      }

      break
    case 'right':
      for (let column = start.column; column <= end.column; column++) {
        picks.push({ row: start.row, column })
      }

      break
    case 'down right':
      for (let row = start.row; row <= end.row; row++) {
        for (let column = start.column; column <= end.column; column++) {
          picks.push({ row, column })
        }
      }

      break
    case 'down':
      for (let row = start.row; row <= end.row; row++) {
        picks.push({ row, column: start.column })
      }

      break
    case 'down left':
      for (let row = start.row; row <= end.row; row++) {
        for (let column = start.column; column >= end.column; column--) {
          picks.push({ row, column })
        }
      }

      break
    case 'left':
      for (let column = start.column; column >= end.column; column--) {
        picks.push({ row: start.row, column })
      }

      break
  }

  return picks
}
