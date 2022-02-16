import { useStorage } from '../extracted'
import type { Storage, StorageOptions } from '../extracted'
import type { Modal } from '../combos'

export type DialogStorage = Storage
export type DialogStorageOptions = StorageOptions

const defaultOptions: DialogStorageOptions = {
  key: 'Baleada Features dialog'
}

export function useDialogStorage (dialog: Modal['dialog'], options: DialogStorageOptions = {}): DialogStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage({
    key,
    initialEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const { status } = JSON.parse(storeable.value.string)
          if (status === 'opened') {
            dialog.open()
          }
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useModal` has already assigned initial value
          break
      }
    },
    getString: () => JSON.stringify({ status: dialog.status.value }),
  })
}
