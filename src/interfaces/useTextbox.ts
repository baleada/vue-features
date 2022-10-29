import { ref, computed, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteableOptions } from '@baleada/logic'
import { on, bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  toInputEffectNames,
} from '../extracted'
import type {
  IdentifiedElementApi,
  History,
  UseHistoryOptions,
} from '../extracted'

export type Textbox = {
  root: IdentifiedElementApi<
    HTMLInputElement | HTMLTextAreaElement,
    { validity: 'valid' | 'invalid' }
  >,
  text: ReturnType<typeof useCompleteable>,
  type: (string: string) => void,
  select: (selection: Completeable['selection']) => void,
  is: {
    valid: () => boolean,
  },
  history: History<HistoryEntry>['entries'],
} & Omit<History<HistoryEntry>, 'entries'>

type HistoryEntry = { string: string, selection: Completeable['selection'] }

export type UseTextboxOptions = {
  initialValue?: string,
  text?: CompleteableOptions,
  history?: UseHistoryOptions,
  stopsPropagation?: boolean,
}

const defaultOptions: UseTextboxOptions = {
  initialValue: '',
  stopsPropagation: false,
}

export function useTextbox (options: UseTextboxOptions = {}): Textbox {
  const {
    initialValue,
    text: textOptions,
    history: historyOptions,
    stopsPropagation,
  } = { ...defaultOptions, ...options }

  
  // ELEMENTS
  const root: Textbox['root'] = useElementApi({
    identified: true,
    defaultMeta: { validity: 'valid' },
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      ariaInvalid: root.meta.value?.validity === 'invalid' ? 'true' : undefined,
    }
  )

  
  // COMPLETEABLE
  const text: Textbox['text'] = useCompleteable(initialValue, textOptions || {}),
        selectionEffect = (event: Event | KeyboardEvent) => {
          if (stopsPropagation) event.stopPropagation()
          text.value.selection = toSelection(event)
        },
        arrowStatus: Ref<'ready' | 'unhandled' | 'handled'> = ref('ready')

  bind(
    root.element,
    { value: computed(() => text.value.string) },
  )

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

  
  // VALIDITY
  const isValid = ref<boolean>(true)
  watch(
    root.meta,
    () => {
      isValid.value = root.meta.value?.validity === 'valid'
    },
    { flush: 'post' }
  )

  
  // HISTORY
  const history: History<HistoryEntry> = useHistory(historyOptions),
        historyEffect = (event: Event | KeyboardEvent) => history.record({
          string: (event.target as HTMLInputElement | HTMLTextAreaElement).value,
          selection: toSelection(event),
        }),
        undo: Textbox['undo'] = options => {      
          if (status === 'undone') {
            history.undo(options)
            return
          }
      
          const lastRecordedString = history.entries.value.array[history.entries.value.array.length - 1].string,
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
      
          status = 'undone'
        },
        redo: Textbox['redo'] = options => {
          history.redo(options)
          status = 'redone'
        }
  
  let status: 'ready' | 'input' | 'undone' | 'redone' = 'ready'

  watch(
    () => history.entries.value.location,
    () => {
      const { string, selection } = history.entries.value.item
      text.value.string = string
      text.value.selection = selection
    },
  )

  history.record({
    string: text.value.string,
    selection: text.value.selection,
  })
  

  // MULTIPLE CONCERNS  
  on(
    root.element,
    {
      input: event => {
        event.preventDefault()
        if (stopsPropagation) event.stopPropagation()

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
                lastRecordedString: history.entries.value.array[history.entries.value.array.length - 1].string,
                previousSelection: text.value.selection,
                newSelection,
              })

        for (const name of effectNames) {
          effectsByName[name]()
        }

        status = 'input'
      },
      select: event => {
        event.preventDefault()
        selectionEffect(event)
      },
      focus: event => text.value.setSelection({ start: 0, end: text.value.string.length, direction: 'forward' }),
      mouseup: selectionEffect,
      touchend: selectionEffect,
      keyup: (event, { is }) => {
        if (is('arrow')) {
          if (!event.shiftKey) selectionEffect(event)
          return
        }

        if (is('meta')) {
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
      },
      keydown: (event, { is }) => {
        if (is('arrow')) {
          // Arrow up won't fire if meta key is held down.
          // Need to store status so that meta keyup can handle selection change.
          if (event.metaKey) arrowStatus.value = 'unhandled'
          return
        }

        if (is('cmd+z') || is('ctrl+z')) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
          undo()
          return
        }

        if (is('cmd+y') || is('ctrl+y')) {
          event.preventDefault()
          if (stopsPropagation) event.stopPropagation()
          redo()
          return
        }
      },
    }
  )


  // API
  return {
    root,
    text,
    type: string => text.value.string = string,
    select: selection => text.value.selection = selection,
    history: computed(() => history.entries.value),
    record: entry => history.record(entry),
    undo,
    redo,
    rewrite: rewritten => history.rewrite(rewritten),
    is: {
      valid: () => isValid.value,
    },
  }
}

function toSelection (event: Event | KeyboardEvent): Completeable['selection'] {
  return {
    start: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionStart,
    end: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionEnd,
    direction: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionDirection,
  }
}
