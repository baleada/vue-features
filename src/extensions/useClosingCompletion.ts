import { watch } from 'vue'
import { on } from '../affordances'
import { useCompleteable } from '@baleada/vue-composition'
import type { Textbox } from '../interfaces'
import type { CompleteOptions } from '@baleada/logic'

export type ClosingCompletion = {
  segmentedBySelection: ReturnType<typeof useCompleteable>
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
  const { root, completeable, history } = textbox

  // SEGMENTED BY SELECTION
  const segmentedBySelection = useCompleteable('', { segment: { from: 'selection', to: 'selection' } })

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
        const closing = toClosing(opening)

        return defineEffect(
          opening as `+${Opening}`,
          event => {
            event.preventDefault()
            
            segmentedBySelection.value.string = completeable.value.string
            segmentedBySelection.value.selection = completeable.value.selection

            const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
                  recordNew = () => history.record({
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
    segmentedBySelection
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
