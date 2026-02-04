import {
  useStorage,
  type Storage,
  type UseStorageOptions,
} from '../extracted'
import { type Checkbox } from '../interfaces'

export type CheckboxStorage = Storage
export type UseCheckboxStorageOptions = UseStorageOptions

const defaultOptions: UseCheckboxStorageOptions = {
  key: 'Baleada Features checkbox',
}

export function useCheckboxStorage (checkbox: Checkbox, options: UseCheckboxStorageOptions = {}): CheckboxStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage(
    checkbox.root.element,
    key,
    storeable => {
      switch (storeable.status) {
        case 'stored':
          const { checked, determinate } = JSON.parse(storeable.string)
          checkbox.checked.value = checked
          checkbox.determinate.value = determinate
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useCheckbox` has already assigned initial value
          break
      }
    },
    () => JSON.stringify({
      checked: checkbox.checked.value,
      determinate: checkbox.determinate.value,
    }),
  )
}
