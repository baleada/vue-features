import { watch } from 'vue'
import { on } from '../affordances'
import { useCompleteable } from '@baleada/vue-composition'
import type { Textbox } from '../interfaces'
import type { CompleteableOptions } from '@baleada/logic'

export type ClosingCompletion = {
  close: (opening: Opening) => Closing,
  completeable: ReturnType<typeof useCompleteable>,
}

export type ClosingCompletionOptions = {
  only?: Opening[],
  completeable?: CompleteableOptions,
}

const defaultOptions: ClosingCompletionOptions = {
  only: ['[', '(', '{', '<', '"', '\'', '`'],
  completeable: { segment: { from: 'selection', to: 'selection' } },
}

export function useClosingCompletion (textbox: Textbox, options: ClosingCompletionOptions = {}): ClosingCompletion {
  // OPTIONS
  const { only: openings, completeable: completeableOptions } = { ...defaultOptions, ...options }

  
  // TEXTBOX ACCESS
  const { root, completeable, history } = textbox


  // SEGMENTED BY SELECTION
  const segmentedBySelection: ClosingCompletion['completeable'] = useCompleteable('', completeableOptions),
        close: ClosingCompletion['close'] = opening => {
          const closing = toClosing(opening)
          
          history.record({
            string: segmentedBySelection.value.complete(
              `${opening}${segmentedBySelection.value.segment}${closing}`,
              { select: 'completion' }
            ).string,
            selection: {
              direction: segmentedBySelection.value.selection.direction,
              start: segmentedBySelection.value.selection.start + 1,
              end: segmentedBySelection.value.selection.end - 1,
            }
          })

          return closing
        }

  watch(
    () => completeable.value.string,
    () => segmentedBySelection.value.string = completeable.value.string
  )
  
  watch(
    () => completeable.value.selection,
    () => segmentedBySelection.value.selection = completeable.value.selection
  )

  on<`+${Opening}`>({
    element: root.element,
    effects: defineEffect => [
      ...openings.map(opening => {
        
        return defineEffect(
          opening as `+${Opening}`,
          event => {
            event.preventDefault()
            
            segmentedBySelection.value.string = completeable.value.string
            segmentedBySelection.value.selection = completeable.value.selection

            const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
                  recordNew = () => close(opening)

            if (completeable.value.string === lastRecordedString) {
              recordNew()
              return
            }

            // Record previous
            history.record({
              string: completeable.value.string,
              selection: completeable.value.selection,
            })

            recordNew()            
          }
        )
      })
    ]
  })

  return {
    close,
    completeable: segmentedBySelection,
  }
}

type Opening = '[' | '(' | '{' | '<' | '"' | '\'' | '`'
type Closing = ']' | ')' | '}' | '>' | '"' | '\'' | '`'

function toClosing (opening: Opening): Closing {
  switch (opening) {
    case '[': return ']'
    case '(': return ')'
    case '{': return '}'
    case '<': return '>'
    case '"': return '"'
    case '\'': return '\''
    case '`': return '`'
  }
}
