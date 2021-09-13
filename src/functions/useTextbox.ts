import { ref, computed, watch, shallowRef, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteableOptions } from '@baleada/logic'
import { on, bind, OnEffect } from '../affordances'
import {
  useHistory,
  useLabel,
  useSingleElement,
  useErrorMessage,
  useDescription,
  useSingleId,
  useDetails,
  preventEffect,
} from '../extracted'
import type {
  SingleElement,
  History,
  UseHistoryOptions
} from '../extracted'

export type Textbox = {
  root: SingleElement<HTMLInputElement | HTMLTextAreaElement>,
  label: SingleElement<HTMLElement>,
  errorMessage: SingleElement<HTMLElement>,
  description: SingleElement<HTMLElement>,
  details: SingleElement<HTMLElement>,
  completeable: Ref<Completeable>,
  history: History<{ string: string, selection: Completeable['selection'] }>,
}

export type UseTextboxOptions = {
  initialValue?: string,
  completeable?: CompleteableOptions,
  history?: UseHistoryOptions,
}

const defaultOptions: UseTextboxOptions = {
  initialValue: '',
}

export function useTextbox (options: UseTextboxOptions = {}): Textbox {
  const { initialValue, completeable: completeableOptions } = { ...defaultOptions, ...options }

  // TARGETS
  const root: Textbox['root'] = useSingleElement<HTMLInputElement | HTMLTextAreaElement>(),
        rootId = useSingleId(root.element),
        label = useLabel(root.element, { htmlFor: rootId }),
        errorMessage = useErrorMessage(root.element),
        description = useDescription(root.element),
        details = useDetails(root.element)

  
  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      id: computed(() => label.element.value ? rootId.value : preventEffect())
    }
  })


  
  // COMPLETEABLE
  const completeable: Textbox['completeable'] = useCompleteable(initialValue, completeableOptions),
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
  
  on<'input' | 'select' | 'focus' | 'pointerup' | '+arrow' | '+cmd' | '+ctrl' | 'cmd+z' | 'cmd+y' | 'ctrl+z' | 'ctrl+y'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'input',
        event => {
          const string = (event.target as HTMLInputElement | HTMLTextAreaElement).value,
                selection = toSelection(event),
                lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
                recordNew = () => {
                  historyEffect(event)
                },
                recordPrevious = () => {
                  history.record({
                    string: completeable.value.string,
                    selection: completeable.value.selection,
                  })
                },
                recordNone = () => {
                  completeable.value.string = string
                  completeable.value.selection = selection
                },
                change: {
                  operation: 'add' | 'remove' | 'replace',
                  quantity: 'single' | 'multiple',
                  previousStatus: 'recorded' | 'unrecorded',
                  newLastCharacter: 'whitespace' | 'character',
                  previousLastCharacter: 'whitespace' | 'character',
                } = {
                  operation:
                    (string.length - completeable.value.string.length > 0 && 'add')
                    || (string.length - completeable.value.string.length < 0 && 'remove')
                    || 'replace',
                  quantity: Math.abs(string.length - completeable.value.string.length) > 1 ? 'multiple': 'single',
                  previousStatus: lastRecordedString === completeable.value.string ? 'recorded': 'unrecorded',
                  newLastCharacter: /\s/.test(string[selection.start - 1]) ? 'whitespace' : 'character',
                  previousLastCharacter: /\s/.test(completeable.value.string[completeable.value.selection.start - 1]) ? 'whitespace' : 'character',
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
            if (lastRecordedString.length > completeable.value.string.length) {
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
            if (lastRecordedString.length > completeable.value.string.length) {
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
        'pointerup',
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
          if (!event.metaKey) {
            arrowStatus.value = 'unhandled'
          }
        }
      ),
      defineEffect(
        'cmd' as '+cmd',
        {
          createEffect: () => cmdOrCtrlUpEffect,
          options: { listen: { keyDirection: 'up' } },
        }
      ),
      defineEffect(
        'ctrl' as '+ctrl',
        {
          createEffect: () => cmdOrCtrlUpEffect,
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

  function cmdOrCtrlUpEffect (event: KeyboardEvent) {
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
  }

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
    label,
    errorMessage,
    description,
    details,
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
