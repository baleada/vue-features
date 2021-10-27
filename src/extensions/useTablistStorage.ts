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
          const selected = Number(storeable.value.string)
          tablist.select(selected)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useTablist` has already assigned initial value
          break
      }
    },
    getString: () => `${tablist.selected.value}`
  })
}
