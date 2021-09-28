import { useStorage } from '../extracted'
import type { Storage, StorageOptions } from '../extracted'
import type { Tablist } from '../interfaces'

export type TablistStorage = Storage
export type TablistStorageOptions = StorageOptions

const defaultOptions: TablistStorageOptions = {
  key: 'Baleada Features tablist'
}

export function useTablistStorage (tablist: Tablist, options: TablistStorageOptions = {}): TablistStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage({
    key,
    initialEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const selected = JSON.parse(storeable.value.string)
          tablist.select.tab(selected.tab)
          tablist.select.panel(selected.panel)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useTablist` has already assigned initial value
          break
      }
    },
    getString: () => JSON.stringify(tablist.selected.value)
  })
}
