import {
  useStorage,
  type Storage,
  type UseStorageOptions,
} from '../extracted'
import { type Grid } from '../interfaces'

export type GridStorage = Storage
export type UseGridStorageOptions = UseStorageOptions

const defaultOptions: UseGridStorageOptions = {
  key: 'Baleada Features grid',
}

export function useGridStorage (grid: Grid<boolean>, options: UseGridStorageOptions = {}): GridStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    grid.cells.plane,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { focused, selected, superselectedFrom } = JSON.parse(storeable.string)
          grid.focus.exact(focused)
          grid.select.exact(selected, { replace: 'all' })
          grid.superselect.from(superselectedFrom)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useGrid` has already assigned initial value
          break
      }
    },
    () => JSON.stringify({
      focused: grid.focused.value,
      selected: grid.selected.value,
      superselectedFrom: grid.selected.value.length - grid.superselected.value.length,
    }),
  )
}
