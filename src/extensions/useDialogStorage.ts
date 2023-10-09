import { useStorage } from '../extracted'
import type { Storage, UseStorageOptions } from '../extracted'
import type { Modal } from '../combos'

export type DialogStorage = Storage
export type  UseDialogStorageOptions = UseStorageOptions

const defaultOptions:  UseDialogStorageOptions = {
  key: 'Baleada Features dialog',
}

export function useDialogStorage (dialog: Modal['dialog'], options:  UseDialogStorageOptions = {}): DialogStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    dialog.root.element,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { status } = JSON.parse(storeable.string)
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
    () => JSON.stringify({ status: dialog.status.value }),
  )
}
