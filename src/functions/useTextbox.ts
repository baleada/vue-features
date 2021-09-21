import { ref, computed, watch, shallowRef, nextTick, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable, useStoreable } from '@baleada/vue-composition'
import { Completeable } from '@baleada/logic'
import type { CompleteableOptions, ListenEffect } from '@baleada/logic'
import { on, bind } from '../affordances'
import {
  useHistory,
  useSingleElement,
} from '../extracted'
import type {
  SingleElement,
  History,
  UseHistoryOptions,
} from '../extracted'

export type Textbox = {
  root: SingleElement<HTMLInputElement | HTMLTextAreaElement>,
  completeable: ReturnType<typeof useCompleteable>,
  history: History<{ string: string, selection: Completeable['selection'] }>,
}

export type UseTextboxOptions = {
  initialValue?: string,
  toValid?: (string: string) => boolean,
  completeable?: CompleteableOptions,
  history?: UseHistoryOptions,
}

const defaultOptions: UseTextboxOptions = {
  toValid: () => true,
  initialValue: '',
}

export function useTextbox (options: UseTextboxOptions = {}): Textbox {
  const {
    initialValue,
    toValid,
    completeable: completeableOptions,
  } = { ...defaultOptions, ...options }

  
  // ELEMENTS
  const root: Textbox['root'] = useSingleElement<HTMLInputElement | HTMLTextAreaElement>()

  
  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      ariaInvalid: computed(() => 
        !toValid(completeable.value.string)
          ? 'true'
          : 'false'
      )
    }
  })

  
  // COMPLETEABLE
  const completeable: Textbox['completeable'] = useCompleteable(initialValue, completeableOptions || {}),
        selectionEffect = (event: Event | KeyboardEvent) => completeable.value.selection = toSelection(event),
        arrowStatus: Ref<'ready' | 'unhandled' | 'handled'> = ref('ready')

  bind({
    element: root.element,
    values: {
      value: computed(() => completeable.value.string),
    },
  })

  watch(
    () => completeable.value.selection,
    () => {
      (root.element.value as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        completeable.value.selection.start,
        completeable.value.selection.end,
        completeable.value.selection.direction,
      )
    },
    { flush: 'post' }
  )

  
  // HISTORY
  const history: Textbox['history'] = useHistory(),
        historyEffect = (event: Event | KeyboardEvent) => history.record({
          string: (event.target as HTMLInputElement | HTMLTextAreaElement).value,
          selection: toSelection(event),
        })

  watch(
    () => history.recorded.value.location,
    () => {
      const { string, selection } = history.recorded.value.item
      completeable.value.string = string
      completeable.value.selection = selection
    },
  )

  history.record({
    string: completeable.value.string,
    selection: completeable.value.selection,
  })
  

  // MULTIPLE CONCERNS
  const status = shallowRef<'ready' | 'inputting' | 'undoing' | 'redoing'>('ready')
  
  on<'input' | 'select' | 'focus' | 'mouseup' | 'touchend' | '+arrow' | '+cmd' | '+ctrl' | 'cmd+z' | 'cmd+y' | 'ctrl+z' | 'ctrl+y'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'input',
        event => {
          const newString = (event.target as HTMLInputElement | HTMLTextAreaElement).value,
                newSelection = toSelection(event)

          inputEffect({
            newString,
            currentString: completeable.value.string,
            lastRecordedString: history.recorded.value.array[history.recorded.value.array.length - 1].string,
            newSelection,
            currentSelection: completeable.value.selection,
            recordNew: () => {
              historyEffect(event)
            },
            recordPrevious: () => {
              history.record({
                string: completeable.value.string,
                selection: completeable.value.selection,
              })
            },
            recordNone: () => {
              completeable.value.string = newString
              completeable.value.selection = newSelection
            },
          })

          status.value = 'inputting'
        },
      ),
      defineEffect(
        'select',
        event => {
          event.preventDefault()
          selectionEffect(event)
        },
      ),
      defineEffect(
        'focus',
        () => completeable.value.setSelection({ start: 0, end: completeable.value.string.length, direction: 'forward' })
      ),
      defineEffect(
        'mouseup',
        selectionEffect
      ),
      defineEffect(
        'touchend',
        selectionEffect
      ),
      defineEffect(
        'arrow' as '+arrow',
        {
          createEffect: () => event => {
            if (!event.shiftKey) {
              selectionEffect(event)
            }
          },
          options: {
            listen: { keyDirection: 'up' },
          },
        }
      ),
      // Same keycombo, but keydown instead of keyup
      defineEffect(
        'arrow' as '+arrow',
        event => {
          if (event.metaKey) {
            // Arrow up won't fire if meta key is held down.
            // Need to store status so that meta keyup can handle selection change.
            arrowStatus.value = 'unhandled'
          }
        }
      ),
      defineEffect(
        'cmd' as '+cmd',
        {
          createEffect: () => event => {
            if (!event.shiftKey) {
              switch (arrowStatus.value) {
                case 'ready':
                case 'handled':
                  // do nothing
                  break
                case 'unhandled':
                  arrowStatus.value = 'handled'
                  selectionEffect(event)
                  break
              }
            }
          },
          options: { listen: { keyDirection: 'up' } },
        }
      ),
      defineEffect(
        'cmd+z',
        event => keyboardUndo(event)
      ),
      defineEffect(
        'ctrl+z',
        event => keyboardUndo(event)
      ),
      defineEffect(
        'cmd+y',
        event => keyboardRedo(event)
      ),
      defineEffect(
        'ctrl+y',
        event => keyboardRedo(event)
      ),
    ],
  })

  function keyboardUndo (event: KeyboardEvent) {
    event.preventDefault()      

    if (status.value === 'undoing') {
      history.undo()
      return
    }

    const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
          recordNew = () => {
            historyEffect(event)
          },
          change: {
            previousStatus: 'recorded' | 'unrecorded',
          } = {
            previousStatus: lastRecordedString === completeable.value.string ? 'recorded': 'unrecorded',
          }
    
    if (change.previousStatus === 'unrecorded') {
      recordNew()
    }
      
    history.undo()

    status.value = 'undoing'
  }

  function keyboardRedo (event: KeyboardEvent) {
    event.preventDefault()
    history.redo()

    status.value = 'redoing'
  }


  // API
  return {
    root,
    completeable,
    history,
  }
}

function toSelection (event: Event | KeyboardEvent): Completeable['selection'] {
  return {
    start: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionStart,
    end: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionEnd,
    direction: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionDirection,
  }
}

export function inputEffect (
  {
    newString,
    currentString,
    lastRecordedString,
    newSelection,
    currentSelection,
    recordNew,
    recordPrevious,
    recordNone,
  }: {
    newString: string,
    currentString: string,
    lastRecordedString: string,
    newSelection: Completeable['selection'],
    currentSelection: Completeable['selection'],
    recordNew: () => void,
    recordPrevious: () => void,
    recordNone: () => void,
  }
) {
  const change: {
    operation: 'add' | 'remove' | 'replace',
    quantity: 'single' | 'multiple',
    previousStatus: 'recorded' | 'unrecorded',
    newLastCharacter: 'whitespace' | 'character',
    previousLastCharacter: 'whitespace' | 'character',
  } = {
    operation:
      (newString.length - currentString.length > 0 && 'add')
      || (newString.length - currentString.length < 0 && 'remove')
      || 'replace',
    quantity: Math.abs(newString.length - currentString.length) > 1 ? 'multiple': 'single',
    previousStatus: lastRecordedString === currentString ? 'recorded': 'unrecorded',
    newLastCharacter: /\s/.test(newString[newSelection.start - 1]) ? 'whitespace' : 'character',
    previousLastCharacter: /\s/.test(currentString[currentSelection.start - 1]) ? 'whitespace' : 'character',
  }

  if (
    change.operation === 'replace'
    && change.previousStatus === 'recorded'
  ) {
    recordNew()
    return
  }
  if (
    change.operation === 'replace'
    && change.previousStatus === 'unrecorded'
  ) {
    recordPrevious()
    recordNew()
    return
  }

  // Adding
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'character' &&
    change.previousStatus === 'recorded'
  ) {
    recordNone()
    return
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'character' &&
    change.previousStatus === 'unrecorded'
  ) {
    // First addition after a sequence of unrecorded removals
    if (lastRecordedString.length > currentString.length) {
      recordPrevious()
      recordNew()
      return
    }

    recordNone()
    return
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'whitespace' &&
    change.previousStatus === 'recorded'
  ) {
    recordNew()
    return
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'whitespace' &&
    change.previousStatus === 'unrecorded'
  ) {
    recordPrevious()
    recordNew()
    return
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'recorded'
  ) {
    recordNew()
    return
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'unrecorded'
  ) {
    recordPrevious()
    recordNew()
    return
  }
  
  // Remove
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'character' &&
    change.previousStatus === 'recorded'
  ) {
    recordNone()
    return
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'character' &&
    change.previousStatus === 'unrecorded'
  ) {
    // Continuing unrecorded removals
    if (lastRecordedString.length > currentString.length) {
      recordNone()
      return
    }
    
    recordPrevious()
    nextTick(() => recordNone())
    return
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'whitespace' &&
    change.previousStatus === 'recorded'
  ) {
    recordNew()
    return
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'whitespace' &&
    change.previousStatus === 'unrecorded'
  ) {
    recordPrevious()
    recordNew()
    return
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'recorded'
  ) {
    recordNew()
    return
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'unrecorded'
  ) {
    recordPrevious()
    recordNew()
    return
  }
}
