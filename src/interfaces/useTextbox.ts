import {
  ref,
  computed,
  watch,
  nextTick,
  type Ref,
} from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import {
  createKeycomboMatch,
  type Completeable,
  type CompleteableOptions,
} from '@baleada/logic'
import { includes } from 'lazy-collections'
import { on, bind } from '../affordances'
import {
  useHistory,
  useElementApi,
  toInputEffectNames,
  toLabelBindValues,
  defaultLabelMeta,
  predicateCmd,
  predicateArrow,
  defaultAbilityMeta,
  defaultValidityMeta,
  useValidity,
  useAbility,
  type AbilityMeta,
  type ElementApi,
  type History,
  type LabelMeta,
  type ValidityMeta,
  type UsedAbility,
  type UsedValidity,
} from '../extracted'

export type Textbox = {
  root: ElementApi<
    HTMLInputElement | HTMLTextAreaElement,
    true,
    (
      & LabelMeta
      & AbilityMeta
      & ValidityMeta
    )
  >,
  text: ReturnType<typeof useCompleteable>,
  type: (string: string) => void,
  select: (selection: Completeable['selection']) => void,
  is: (
    & UsedAbility['is']
    & UsedValidity['is']
  ),
  history: History<HistoryEntry>['entries'],
} & Omit<History<HistoryEntry>, 'entries'>

type HistoryEntry = { string: string, selection: Completeable['selection'] }

export type UseTextboxOptions = {
  initialValue?: string,
  text?: CompleteableOptions,
}

const defaultOptions: UseTextboxOptions = {
  initialValue: '',
}

export function useTextbox (options: UseTextboxOptions = {}): Textbox {
  const {
    initialValue,
    text: textOptions,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root: Textbox['root'] = useElementApi({
    identifies: true,
    defaultMeta: {
      ...defaultLabelMeta,
      ...defaultAbilityMeta,
      ...defaultValidityMeta,
    },
  })


  // BASIC BINDINGS
  bind(
    root.element,
    toLabelBindValues(root),
  )


  // ABILITY
  const withAbility = useAbility(root)


  // VALIDITY
  const withValidity = useValidity(root)


  // COMPLETEABLE
  const text: Textbox['text'] = useCompleteable(initialValue, textOptions || {}),
        selectionEffect = (event: Event | KeyboardEvent) => {
          text.selection = toSelection(event)
        },
        arrowStatus: Ref<'ready' | 'unhandled' | 'handled'> = ref('ready')

  bind(
    root.element,
    { value: computed(() => text.string) },
  )

  watch(
    () => text.selection,
    () => {
      if (!includes(root.element.value?.type)(selectableInputTypes)) return

      (root.element.value as HTMLInputElement | HTMLTextAreaElement)?.setSelectionRange(
        text.selection.start,
        text.selection.end,
        text.selection.direction,
      )
    },
    { flush: 'post' }
  )


  // VALIDITY
  const isValid = ref<boolean>(true)
  watch(
    root.meta,
    () => {
      isValid.value = root.meta.value.validity === 'valid'
    },
    { flush: 'post' }
  )


  // HISTORY
  const history: History<HistoryEntry> = useHistory(),
        historyEffect = (event: Event | KeyboardEvent) => history.record({
          string: (event.target as HTMLInputElement | HTMLTextAreaElement).value,
          selection: toSelection(event),
        }),
        undo: Textbox['undo'] = options => {
          if (status === 'undone') {
            history.undo(options)
            return
          }

          const lastRecordedString = history.entries.array[history.entries.array.length - 1].string,
                recordNew = () => history.record({
                  string: text.string,
                  selection: text.selection,
                }),
                change: {
                  previousStatus: 'recorded' | 'unrecorded',
                } = {
                  previousStatus: lastRecordedString === text.string ? 'recorded': 'unrecorded',
                }

          if (change.previousStatus === 'unrecorded') {
            recordNew()
            nextTick(() => history.undo(options))
            status = 'undone'
            return
          }

          history.undo(options)
          status = 'undone'
        },
        redo: Textbox['redo'] = options => {
          history.redo(options)
          status = 'redone'
        }

  let status: 'ready' | 'input' | 'undone' | 'redone' = 'ready'
  let inputEffectStatus: 'idle' | 'syncing' = 'idle'

  watch(
    () => history.entries.location,
    () => {
      if (inputEffectStatus === 'syncing') return
      const { string, selection } = history.entries.item
      text.string = string
      text.selection = selection
    },
  )

  history.record({
    string: text.string,
    selection: text.selection,
  })


  // MULTIPLE CONCERNS
  on(
    root.element,
    {
      input: event => {
        event.preventDefault()

        const newString = (event.target as HTMLInputElement | HTMLTextAreaElement).value,
              newSelection = toSelection(event),
              effectsByName: Record<ReturnType<typeof toInputEffectNames>[0], () => void> = {
                recordNew: () => {
                  historyEffect(event)
                },
                recordPrevious: () => {
                  history.record({
                    string: text.string,
                    selection: text.selection,
                  })
                },
                sync: () => {
                  inputEffectStatus = 'syncing'
                  nextTick(() => inputEffectStatus = 'idle')
                  text.string = newString
                  text.selection = newSelection
                },
              },
              effectNames = toInputEffectNames({
                previousString: text.string,
                newString,
                lastRecordedString: history.entries.array[history.entries.array.length - 1].string,
                previousSelection: text.selection,
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
      focus: () => text.setSelection({ start: 0, end: text.string.length, direction: 'forward' }),
      pointerup: selectionEffect,
      keyup: event => {
        if (predicateArrow(event)) {
          if (!event.shiftKey) selectionEffect(event)
          return
        }

        if (predicateCmd(event)) {
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
      keydown: event => {
        if (createKeycomboMatch('arrow')(event)) {
          // Arrow up won't fire if meta key is held down.
          // Need to store status so that meta keyup can handle selection change.
          if (event.metaKey) arrowStatus.value = 'unhandled'
          return
        }

        if (createKeycomboMatch('cmd+z')(event) || createKeycomboMatch('ctrl+z')(event)) {
          event.preventDefault()
          undo()
          return
        }

        if (createKeycomboMatch('cmd+y')(event) || createKeycomboMatch('ctrl+y')(event)) {
          event.preventDefault()
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
    type: string => text.string = string,
    select: selection => text.selection = selection,
    history: history.entries,
    record: entry => history.record(entry),
    undo,
    redo,
    rewrite: rewritten => history.rewrite(rewritten),
    is: {
      ...withAbility.is,
      ...withValidity.is,
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

const selectableInputTypes = [
  'password',
  'search',
  'tel',
  'text',
]
