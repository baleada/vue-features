import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { Completeable } from '@baleada/logic'
import type { CompleteableOptions } from '@baleada/logic'
import { on, bind } from '../affordances'
import { useHistory, useSingleElement } from '../extracted'
import type { SingleElement, History, UseHistoryOptions } from '../extracted'

export type Input = {
  root: SingleElement<HTMLInputElement>,
  completeable: Ref<Completeable>,
  history: History<{ string: Completeable['string'], selection: Completeable['selection'] }>,
}

export type UseInputOptions = {
  initialValue?: string,
  completeable?: CompleteableOptions,
  history?: UseHistoryOptions,
}

const defaultOptions: UseInputOptions = {
  initialValue: '',
}

export function useInput (options: UseInputOptions = {}): Input {
  const { initialValue, completeable: completeableOptions } = { ...defaultOptions, ...options }

  // TARGET SETUP
  const root = useSingleElement<HTMLInputElement>()

  
  // COMPLETEABLE
  const completeable = useCompleteable(initialValue, completeableOptions),
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
      (root.element.value as HTMLInputElement).setSelectionRange(
        completeable.value.selection.start,
        completeable.value.selection.end,
        completeable.value.selection.direction,
      )
    },
    { flush: 'post' }
  )

  
  // HISTORY
  const history: Input['history'] = useHistory(),
        historyEffect = (event: Event | KeyboardEvent) => history.record({
          string: (event.target as HTMLInputElement).value,
          selection: toSelection(event),
        })

  history.record({
    string: completeable.value.string,
    selection: completeable.value.selection,
  })

  watch(
    () => history.recorded.value.location,
    () => {
      const { string, selection } = history.recorded.value.item
      console.log(JSON.parse(JSON.stringify(history.recorded.value.array)))
      completeable.value.string = string
      completeable.value.selection = selection
    },
  )

  on<'input' | 'select' | 'focus' | 'pointerup' | '+arrow' | '+cmd' | 'cmd+z' | 'cmd+y'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'input',
        event => {
          const newString = (event.target as HTMLInputElement).value,
                newSelection = toSelection(event)

          // Copy/paste
          if (newString.length - completeable.value.string.length > 1) {
            console.log('copy/paste')
            historyEffect(event)
            return
          }

          // Select & delete
          if (completeable.value.string.length - newString.length > 1) {
            console.log('select/delete')
            historyEffect(event)
            return
          }

          // Only one character was added or removed
          
          // const wordOptions: CompleteableOptions = {
          //         segment: {
          //           from: 'divider',
          //           to: 'divider',
          //         },
          //       },
          //       currentWord = new Completeable(completeable.value.string, wordOptions)
          //         .setSelection(completeable.value.selection)
          //         .segment,
          //       newWord = new Completeable(newString, wordOptions)
          //         .setSelection(newSelection)
          //         .segment

          // Added a character
          if (newString.length > completeable.value.string.length) {
            if (/\s/.test(newString[newSelection.start - 1])) {
              console.log('added')
              historyEffect(event)
              return
            }
          }
          
          // Removed a character
          if (completeable.value.string.length > newString.length) {
            if (/\s/.test(completeable.value.string[completeable.value.selection.start - 1])) {
              console.log('removed')
              historyEffect(event)
              return
            }
          }          
        
          console.log('no history')
          completeable.value.string = newString
          completeable.value.selection = newSelection
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
          history.undo()
        }
      ),
      defineEffect(
        'cmd+y',
        event => {
          event.preventDefault()
          history.redo()
        }
      ),
    ],
  })


  // API
  return {
    root,
    completeable,
    history,
  }
}

function toSelection (event: Event | KeyboardEvent): Completeable['selection'] {
  return {
    start: (event.target as HTMLInputElement).selectionStart,
    end: (event.target as HTMLInputElement).selectionEnd,
    direction: (event.target as HTMLInputElement).selectionDirection,
  }
}
