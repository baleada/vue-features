import { useStorage } from '../extracted'
import type { Storage, UseStorageOptions } from '../extracted'
import type { Button } from '../interfaces'

export type ButtonStorage = Storage
export type  UseButtonStorageOptions = UseStorageOptions

const defaultOptions:  UseButtonStorageOptions = {
  key: 'Baleada Features button'
}

export function useButtonStorage (button: Button<true>, options:  UseButtonStorageOptions = {}): ButtonStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    button.root.element,
    key,
    storeable => {
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
    () => JSON.stringify({ status: button.status.value }),
  )
}
