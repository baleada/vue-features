import { watch } from 'vue'
import { bind } from '../affordances'
import {
  useHistory,
  usePlaneFeatures,
  defaultLabelMeta,
  usePlaneApi,
  useListApi,
  toTokenList,
  useRootAndKeyboardTarget,
  defaultAbilityMeta,
  defaultValidityMeta,
} from '../extracted'
import type {
  ListApi,
  PlaneApi,
  History,
  PlaneFeatures,
  UsePlaneFeaturesConfig,
  LabelMeta,
  Coordinates,
  RootAndKeyboardTarget,
  AbilityMeta,
  ValidityMeta,
} from '../extracted'
import { createMultiRef } from '../transforms'

export type Grid<Multiselectable extends boolean = false> = (
  & GridBase
  & PlaneFeatures<Multiselectable>
)

type GridBase = (
  & RootAndKeyboardTarget<LabelMeta & AbilityMeta & ValidityMeta>
  & {
    rowgroups: ListApi<HTMLElement, true>,
    rows: ListApi<HTMLElement, true>,
    cells: PlaneApi<
      HTMLElement,
      true,
      (
        & LabelMeta
        & AbilityMeta
        & {
          candidate?: string,
          span?: {
            row?: number,
            column?: number,
          },
          kind?: 'cell' | 'rowheader' | 'columnheader',
        }
      )
    >,
    history: History<{
      focused: Coordinates,
      selected: Coordinates[],
    }>,
  }
)

export type UseGridOptions<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = (
  & UseGridOptionsBase<Multiselectable, Clears>
  & Partial<Omit<
    UsePlaneFeaturesConfig<Multiselectable, Clears>,
    | 'rootApi'
    | 'planeApi'
    | 'disabledElementsReceiveFocus'
    | 'multiselectable'
    | 'clears'
  >>
)

type UseGridOptionsBase<
  Multiselectable extends boolean = false,
  Clears extends boolean = false
> = {
  multiselectable?: Multiselectable,
  clears?: Clears,
  disabledOptionsReceiveFocus?: boolean,
  needsAriaOwns?: boolean, // TODO: support grid->(rowgroups or rows), rowgroup->rows
}

const defaultOptions: UseGridOptions<true, true> = {
  clears: true,
  disabledOptionsReceiveFocus: true,
  initialFocused: 'selected',
  initialSelected: { row: 0, column: 0 },
  initialKeyboardStatus: 'focusing',
  initialSuperselectedFrom: 0,
  loops: false,
  multiselectable: true,
  needsAriaOwns: false,
  query: { matchThreshold: 1 },
  receivesFocus: true,
}

export function useGrid<
  Multiselectable extends boolean = true,
  Clears extends boolean = true
> (options: UseGridOptions<Multiselectable, Clears> = {}): Grid<Multiselectable> {
  // OPTIONS
  const {
    clears,
    disabledOptionsReceiveFocus,
    initialFocused,
    initialSelected,
    initialSuperselectedFrom,
    initialKeyboardStatus,
    loops,
    multiselectable,
    needsAriaOwns,
    query,
    receivesFocus,
  } = ({ ...defaultOptions, ...options } as UseGridOptions<Multiselectable, Clears>)


  // ELEMENTS
  const { root, keyboardTarget }: {
          root: Grid<true>['root'],
          keyboardTarget: Grid<true>['keyboardTarget'],
        } = useRootAndKeyboardTarget({
          defaultRootMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            ...defaultValidityMeta,
          },
          defaultKeyboardTargetMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            ...defaultValidityMeta,
            targetability: 'targetable',
          },
        }),
        rowgroups: Grid<true>['rowgroups'] = useListApi({ identifies: true }),
        rows: Grid<true>['rows'] = useListApi({ identifies: true }),
        cells: Grid<true>['cells'] = usePlaneApi({
          identifies: true,
          defaultMeta: {
            ...defaultLabelMeta,
            ...defaultAbilityMeta,
            kind: 'cell',
            candidate: '',
            span: { row: 1, column: 1 },
          },
        })


  // MULTIPLE CONCERNS
  const {
    focus,
    focused,
    select,
    selected,
    ...planeFeatures
  } = usePlaneFeatures({
    rootApi: root,
    keyboardTargetApi: keyboardTarget,
    planeApi: cells,
    clears,
    disabledElementsReceiveFocus: disabledOptionsReceiveFocus,
    initialFocused,
    initialSelected,
    initialSuperselectedFrom,
    initialKeyboardStatus,
    loops,
    multiselectable: multiselectable as true,
    query,
    receivesFocus,
  })


  // HISTORY
  const history: Grid<true>['history'] = useHistory()

  watch(
    () => history.entries.location,
    () => {
      const { focused, selected } = history.entries.item
      focus.exact(focused)
      select.exact(selected, { replace: 'all' })
    },
  )

  history.record({
    focused: focused.value,
    selected: selected.value,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    { role: 'grid' }
  )

  bind(
    rowgroups.list,
    { role: 'rowgroup' }
  )

  bind(
    rows.list,
    {
      role: 'row',
      ...(
        needsAriaOwns
          ? {
            ariaOwns: {
              get: row => toTokenList(cells.ids.value[row]) as string,
              watchSource: cells.ids,
            },
          }
          : undefined
      ),
      // TODO: aria-disabled
    }
  )

  bind(
    cells.plane,
    {
      role: coordinates => {
        const { kind } = cells.meta.value.get(coordinates)

        return kind === 'cell'
          ? 'gridcell'
          : kind
      },
    }
  )


  // API
  return {
    root: {
      ...root,
      ref: meta => createMultiRef(
        root.ref(meta),
        keyboardTarget.ref(),
      ),
    },
    keyboardTarget,
    rowgroups,
    rows,
    cells,
    focused,
    focus,
    selected,
    select,
    history,
    ...planeFeatures,
  } as Grid<Multiselectable>
}
