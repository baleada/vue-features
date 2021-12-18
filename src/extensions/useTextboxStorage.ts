import { useStorage } from '../extracted'
import { Storage, StorageOptions } from '../extracted'
import type { Textbox } from '../interfaces'

export type TextboxStorage = Storage
export type TextboxStorageOptions = StorageOptions

const defaultOptions: TextboxStorageOptions = {
  key: 'Baleada Features textbox'
}

export function useTextboxStorage (textbox: Textbox, options: TextboxStorageOptions = {}): TextboxStorage {
  const { key } = { ...defaultOptions, ...options },
        { text, history, rewrite } = textbox

  return useStorage({
    key,
    initialEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const { string, selection } = JSON.parse(storeable.value.string)
          text.value.string = string
          text.value.selection = selection

          rewrite([
            {
              string: text.value.string,
              selection: text.value.selection,
            }
          ])
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useTextbox` has already assigned initial value
          break
      }
    },
    getString: () => JSON.stringify(history.value.item)
  })
}
