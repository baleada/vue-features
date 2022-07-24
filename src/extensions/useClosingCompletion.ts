import { watch } from 'vue'
import { on } from '../affordances'
import { useCompleteable } from '@baleada/vue-composition'
import type { Textbox } from '../interfaces'

export type ClosingCompletion = {
  close: (opening: Opening) => Closing,
  segmentedBySelection: ReturnType<typeof useCompleteable>,
}

export type UseClosingCompletionOptions = {
  only?: Opening[],
}

const defaultOptions: UseClosingCompletionOptions = {
  only: ['[', '(', '{', '<', '"', '\'', '`'],
}

export function useClosingCompletion (textbox: Textbox, options: UseClosingCompletionOptions = {}): ClosingCompletion {
  // OPTIONS
  const { only: openings } = { ...defaultOptions, ...options }

  
  // TEXTBOX ACCESS
  const { root, text, history, record } = textbox


  // SEGMENTED BY SELECTION
  const segmentedBySelection: ClosingCompletion['segmentedBySelection'] = useCompleteable('', { segment: { from: 'selection', to: 'selection' } }),
        close: ClosingCompletion['close'] = opening => {
          const closing = toClosing(opening)
          
          record({
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

  on(
    root.element,
    {
      keydown: (event, { is }) => {
        for (const opening of openings) {
          if (is(opening)) {
            event.preventDefault()
            
            segmentedBySelection.value.string = text.value.string
            segmentedBySelection.value.selection = text.value.selection

            const lastRecordedString = history.value.array[history.value.array.length - 1].string,
                  recordNew = () => close(opening)

            if (text.value.string === lastRecordedString) {
              recordNew()
              return
            }

            // Record previous
            record({
              string: text.value.string,
              selection: text.value.selection,
            })

            recordNew()

            return
          }
        }
      }
    }
  )

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
