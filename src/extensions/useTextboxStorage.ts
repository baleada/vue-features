import { useStorage } from '../extracted'
import { Storage, UseStorageOptions } from '../extracted'
import type { Textbox } from '../interfaces'

export type TextboxStorage = Storage
export type  UseTextboxStorageOptions = UseStorageOptions

const defaultOptions:  UseTextboxStorageOptions = {
  key: 'Baleada Features textbox'
}

export function useTextboxStorage (textbox: Textbox, options:  UseTextboxStorageOptions = {}): TextboxStorage {
  const { key } = { ...defaultOptions, ...options },
        { text, history, rewrite } = textbox

  return useStorage(
    textbox.root.element,
    key,
    storeable => {
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
    () => JSON.stringify(history.value.item)
  )
}
