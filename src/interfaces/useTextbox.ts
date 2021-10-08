import { ref, computed, watch, shallowRef, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { Completeable } from '@baleada/logic'
import type { CompleteableOptions } from '@baleada/logic'
import { on, bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  toInputEffectNames,
} from '../extracted'
import type {
  ElementApi,
  History,
  UseHistoryOptions,
} from '../extracted'

export type Textbox = {
  root: ElementApi<HTMLInputElement | HTMLTextAreaElement, 'single', false>,
  completeable: ReturnType<typeof useCompleteable>,
  history: History<{ string: string, selection: Completeable['selection'] }>,
  type: (string: string) => void,
  select: (selection: Completeable['selection']) => void,
  undo: (options?: Parameters<Textbox['history']['undo']>[0]) => void,
  redo: (options?: Parameters<Textbox['history']['redo']>[0]) => void,
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
    history: historyOptions,
  } = { ...defaultOptions, ...options }

  
  // ELEMENTS
  const root: Textbox['root'] = useElementApi({ type: 'single' })

  
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
  const history: Textbox['history'] = useHistory(historyOptions),
        historyEffect = (event: Event | KeyboardEvent) => history.record({
          string: (event.target as HTMLInputElement | HTMLTextAreaElement).value,
          selection: toSelection(event),
        }),
        undo: Textbox['undo'] = (options) => {      
          if (status.value === 'undone') {
            history.undo(options)
            return
          }
      
          const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
                recordNew = () => history.record({
                  string: completeable.value.string,
                  selection: completeable.value.selection,
                }),
                change: {
                  previousStatus: 'recorded' | 'unrecorded',
                } = {
                  previousStatus: lastRecordedString === completeable.value.string ? 'recorded': 'unrecorded',
                }
          
          if (change.previousStatus === 'unrecorded') {
            recordNew()
          }
            
          history.undo(options)
      
          status.value = 'undone'
        },
        redo: Textbox['redo'] = (options) => {
          history.redo(options)
          status.value = 'redone'
        },
        status = shallowRef<'ready' | 'input' | 'undone' | 'redone'>('ready')

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
  on<'input' | 'select' | 'focus' | 'mouseup' | 'touchend' | '+arrow' | '+cmd' | '+ctrl' | 'cmd+z' | 'cmd+y' | 'ctrl+z' | 'ctrl+y'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'input',
        event => {
          event.preventDefault()

          const newString = (event.target as HTMLInputElement | HTMLTextAreaElement).value,
                newSelection = toSelection(event),
                effectsByName: Record<ReturnType<typeof toInputEffectNames>[0], () => void> = {
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
                  nextTickRecordNone: () => nextTick(() => {
                    completeable.value.string = newString
                    completeable.value.selection = newSelection
                  }),
                },
                effectNames = toInputEffectNames({
                  previousString: completeable.value.string,
                  newString,
                  lastRecordedString: history.recorded.value.array[history.recorded.value.array.length - 1].string,
                  previousSelection: completeable.value.selection,
                  newSelection,
                })

          for (const name of effectNames) {
            effectsByName[name]()
          }

          status.value = 'input'
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
        event => {
          event.preventDefault()
          undo()
        }
      ),
      defineEffect(
        'ctrl+z',
        event => {
          event.preventDefault()
          undo()
        }
      ),
      defineEffect(
        'cmd+y',
        event => {
          event.preventDefault()
          redo()
        }
      ),
      defineEffect(
        'ctrl+y',
        event => {
          event.preventDefault()
          redo()
        }
      ),
    ],
  })


  // API
  return {
    root,
    completeable,
    history,
    type: string => completeable.value.string = string,
    select: selection => completeable.value.selection = selection,
    undo,
    redo,
  }
}

function toSelection (event: Event | KeyboardEvent): Completeable['selection'] {
  return {
    start: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionStart,
    end: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionEnd,
    direction: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionDirection,
  }
}
