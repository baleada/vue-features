import {
  useStorage,
  type Storage,
  type UseStorageOptions,
} from '../extracted'
import { type Separator } from '../interfaces'

export type SeparatorStorage = Storage
export type UseSeparatorStorageOptions = UseStorageOptions

const defaultOptions: UseSeparatorStorageOptions = {
  key: 'Baleada Features separator',
}

export function useSeparatorStorage (separator: Separator<'variable'> | Separator<'fixed'>, options: UseSeparatorStorageOptions = {}): SeparatorStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    separator.root.element,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { position } = JSON.parse(storeable.string)
          separator.exact(position)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useSeparator` has already assigned initial value
          break
      }
    },
    () => JSON.stringify({
      position: separator.position.value,
    }),
  )
}
