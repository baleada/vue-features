import { ref, computed, watch, shallowRef, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteableOptions } from '@baleada/logic'
import { on, bind } from '../affordances'
import type { BindValueGetterObject } from '../affordances'
import {
  useHistory,
  useElementApi,
  toInputEffectNames,
  ensureGetStatus,
  ensureWatchSourcesFromGetStatus
} from '../extracted'
import type {
  SingleElementApi,
  History,
  UseHistoryOptions,
  BindValue
} from '../extracted'

export type Textbox = {
  root: SingleElementApi<HTMLInputElement | HTMLTextAreaElement>,
  text: ReturnType<typeof useCompleteable>,
  history: History<{ string: string, selection: Completeable['selection'] }>,
  type: (string: string) => void,
  select: (selection: Completeable['selection']) => void,
  undo: (options?: Parameters<Textbox['history']['undo']>[0]) => void,
  redo: (options?: Parameters<Textbox['history']['redo']>[0]) => void,
}

export type UseTextboxOptions = {
  initialValue?: string,
  getValidity?: BindValue<'valid' | 'invalid'> | BindValueGetterObject<'valid' | 'invalid'>,
  text?: CompleteableOptions,
  history?: UseHistoryOptions,
}

const defaultOptions: UseTextboxOptions = {
  getValidity: 'valid',
  initialValue: '',
}

export function useTextbox (options: UseTextboxOptions = {}): Textbox {
  const {
    initialValue,
    getValidity,
    text: textOptions,
    history: historyOptions,
  } = { ...defaultOptions, ...options }

  
  // ELEMENTS
  const root: Textbox['root'] = useElementApi()


  // UTILS
  const ensuredGetValidity = ensureGetStatus({ element: root.element, getStatus: getValidity })

  
  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      ariaInvalid: {
        getValue: () => ensuredGetValidity() === 'invalid' ? 'true' : undefined,
        watchSources: [
          () => text.value.string,
          ...ensureWatchSourcesFromGetStatus(getValidity),
        ],
      }
    }
  })

  
  // COMPLETEABLE
  const text: Textbox['text'] = useCompleteable(initialValue, textOptions || {}),
        selectionEffect = (event: Event | KeyboardEvent) => text.value.selection = toSelection(event),
        arrowStatus: Ref<'ready' | 'unhandled' | 'handled'> = ref('ready')

  bind({
    element: root.element,
    values: {
      value: computed(() => text.value.string),
    },
  })

  watch(
    () => text.value.selection,
    () => {
      (root.element.value as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        text.value.selection.start,
        text.value.selection.end,
        text.value.selection.direction,
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
                  string: text.value.string,
                  selection: text.value.selection,
                }),
                change: {
                  previousStatus: 'recorded' | 'unrecorded',
                } = {
                  previousStatus: lastRecordedString === text.value.string ? 'recorded': 'unrecorded',
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
      text.value.string = string
      text.value.selection = selection
    },
  )

  history.record({
    string: text.value.string,
    selection: text.value.selection,
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
                      string: text.value.string,
                      selection: text.value.selection,
                    })
                  },
                  recordNone: () => {
                    text.value.string = newString
                    text.value.selection = newSelection
                  },
                  nextTickRecordNone: () => nextTick(() => {
                    text.value.string = newString
                    text.value.selection = newSelection
                  }),
                },
                effectNames = toInputEffectNames({
                  previousString: text.value.string,
                  newString,
                  lastRecordedString: history.recorded.value.array[history.recorded.value.array.length - 1].string,
                  previousSelection: text.value.selection,
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
        () => text.value.setSelection({ start: 0, end: text.value.string.length, direction: 'forward' })
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
    text,
    history,
    type: string => text.value.string = string,
    select: selection => text.value.selection = selection,
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
