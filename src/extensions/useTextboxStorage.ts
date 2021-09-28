import { useStorage } from '../extracted'
import { Storage, StorageOptions } from '../extracted'
import type { Textbox } from '../interfaces'

export type TextboxStorage = Storage
export type TextboxStorageOptions = StorageOptions

const defaultOptions: TextboxStorageOptions = {
  key: 'Baleada Features textbox'
}

export function useTextboxStorage (textbox: Textbox, options: TextboxStorageOptions = {}): TextboxStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage({
    key,
    initialEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const { string, selection } = JSON.parse(storeable.value.string)
          textbox.completeable.value.string = string
          textbox.completeable.value.selection = selection

          textbox.history.recorded.value.array = [
            {
              string: textbox.completeable.value.string,
              selection: textbox.completeable.value.selection,
            }
          ]
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useTextbox` has already assigned initial value
          break
      }
    },
    getString: () => JSON.stringify(textbox.history.recorded.value.item)
  })
}
