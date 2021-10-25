import { watch } from 'vue'
import { on } from '../affordances'
import { useCompleteable } from '@baleada/vue-composition'
import type { Textbox } from '../interfaces'
import type { CompleteableOptions } from '@baleada/logic'

export type ClosingCompletion = {
  close: (opening: Opening) => Closing,
  segmentedBySelection: ReturnType<typeof useCompleteable>,
}

export type ClosingCompletionOptions = {
  only?: Opening[],
}

const defaultOptions: ClosingCompletionOptions = {
  only: ['[', '(', '{', '<', '"', '\'', '`'],
}

export function useClosingCompletion (textbox: Textbox, options: ClosingCompletionOptions = {}): ClosingCompletion {
  // OPTIONS
  const { only: openings } = { ...defaultOptions, ...options }

  
  // TEXTBOX ACCESS
  const { root, text, history } = textbox


  // SEGMENTED BY SELECTION
  const segmentedBySelection: ClosingCompletion['segmentedBySelection'] = useCompleteable('', { segment: { from: 'selection', to: 'selection' } }),
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
    () => text.value.string,
    () => segmentedBySelection.value.string = text.value.string
  )
  
  watch(
    () => text.value.selection,
    () => segmentedBySelection.value.selection = text.value.selection
  )

  on<`+${Opening}`>({
    element: root.element,
    effects: defineEffect => [
      ...openings.map(opening => {
        
        return defineEffect(
          opening as `+${Opening}`,
          event => {
            event.preventDefault()
            
            segmentedBySelection.value.string = text.value.string
            segmentedBySelection.value.selection = text.value.selection

            const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
                  recordNew = () => close(opening)

            if (text.value.string === lastRecordedString) {
              recordNew()
              return
            }

            // Record previous
            history.record({
              string: text.value.string,
              selection: text.value.selection,
            })

            recordNew()            
          }
        )
      })
    ]
  })

  return {
    close,
    segmentedBySelection,
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
