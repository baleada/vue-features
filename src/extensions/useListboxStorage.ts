import {
  useStorage,
  type Storage,
  type UseStorageOptions,
} from '../extracted'
import { type Listbox } from '../interfaces'

export type ListboxStorage = Storage
export type UseListboxStorageOptions = UseStorageOptions

const defaultOptions: UseListboxStorageOptions = {
  key: 'Baleada Features listbox',
}

export function useListboxStorage (listbox: Listbox<boolean>, options: UseListboxStorageOptions = {}): ListboxStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    listbox.options.list,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { focused, selected, superselectedFrom } = JSON.parse(storeable.string)
          listbox.focusedOption.navigate(focused)
          listbox.selectedOptions.pick(selected, { replace: 'all' })
          listbox.superselect.from(superselectedFrom)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useListbox` has already assigned initial value
          break
      }
    },
    () => JSON.stringify({
      focused: listbox.focusedOption.location,
      selected: listbox.selectedOptions.picks,
      superselectedFrom: listbox.selected.value.length - listbox.superselected.value.length,
    }),
  )
}
