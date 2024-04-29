import { useStorage } from '../extracted'
import type { Storage, UseStorageOptions } from '../extracted'
import type { Tablist } from '../interfaces'

export type TablistStorage = Storage
export type  UseTablistStorageOptions = UseStorageOptions

const defaultOptions:  UseTablistStorageOptions = {
  key: 'Baleada Features tablist',
}

export function useTablistStorage (tablist: Tablist, options:  UseTablistStorageOptions = {}): TablistStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    tablist.tabs.list,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { selected, focused } = JSON.parse(storeable.string)
          tablist.focus.exact(focused)
          tablist.select.exact(selected)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useTablist` has already assigned initial value
          break
      }
    },
    () => JSON.stringify({
      focused: tablist.focusedTab.location,
      selected: tablist.selectedTab.newest,
    }),
  )
}
