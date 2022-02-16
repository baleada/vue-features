import { useStorage } from '../extracted'
import type { Storage, StorageOptions } from '../extracted'
import type { Button } from '../interfaces'

export type ButtonStorage = Storage
export type ButtonStorageOptions = StorageOptions

const defaultOptions: ButtonStorageOptions = {
  key: 'Baleada Features button'
}

export function useButtonStorage (button: Button<true>, options: ButtonStorageOptions = {}): ButtonStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage({
    key,
    initialEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const { status } = JSON.parse(storeable.value.string)
          if (status === 'on') {
            button.on()
          }

          if (status === 'off') {
            button.off()
          }
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useModal` has already assigned initial value
          break
      }
    },
    getString: () => JSON.stringify({ status: button.status.value }),
  })
}
