import {
  useStorage,
  type Storage,
  type UseStorageOptions,
} from '../extracted'
import { type Menubar } from '../interfaces'

export type MenubarStorage = Storage
export type UseMenubarStorageOptions = UseStorageOptions

const defaultOptions: UseMenubarStorageOptions = {
  key: 'Baleada Features menubar',
}

export function useMenubarStorage (menubar: Menubar<boolean>, options: UseMenubarStorageOptions = {}): MenubarStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    menubar.items.list,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { focused, selected, superselectedFrom } = JSON.parse(storeable.string)
          menubar.focusedItem.navigate(focused)
          menubar.selectedItems.pick(selected, { replace: 'all' })
          menubar.superselect.from(superselectedFrom)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useMenubar` has already assigned initial value
          break
      }
    },
    () => JSON.stringify({
      focused: menubar.focusedItem.location,
      selected: menubar.selectedItems.picks,
      superselectedFrom: menubar.selected.value.length - menubar.superselected.value.length,
    }),
  )
}
