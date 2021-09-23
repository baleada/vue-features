import { on } from '../affordances'
import { useCompleteable } from '@baleada/vue-composition'
import type { Textbox } from '../interfaces'

export type BracketAndQuoteCompletion = {
  segmentedBySelection: ReturnType<typeof useCompleteable>
}

export function useBracketAndQuoteCompletion (textbox: Textbox): BracketAndQuoteCompletion {
  const segmentedBySelection = useCompleteable('', { segment: { from: 'selection', to: 'selection' } })

  on<`+${OpenBracketOrQuote}`>({
    element: textbox.root.element,
    effects: defineEffect => [
      ...(['[', '(', '{', '<', '"', '\'', '`'] as OpenBracketOrQuote[]).map(openBracketOrQuote => {
        const closedBrackedOrQuote = toClosedBracketOrQuote(openBracketOrQuote)

        return defineEffect(
          openBracketOrQuote as '+[',
          event => {
            event.preventDefault()
            
            segmentedBySelection.value
              .setString(textbox.completeable.value.string)
              .setSelection(textbox.completeable.value.selection)

            const lastRecordedString = textbox.history.recorded.value.array[textbox.history.recorded.value.array.length - 1].string,
                  recordBracketOrQuoteCompletion = () => textbox.history.record({
                    string: segmentedBySelection.value.complete(
                      `${openBracketOrQuote}${segmentedBySelection.value.segment}${closedBrackedOrQuote}`,
                      { select: 'completion' }
                    ).string,
                    selection: {
                      direction: segmentedBySelection.value.selection.direction,
                      start: segmentedBySelection.value.selection.start + 1,
                      end: segmentedBySelection.value.selection.end - 1,
                    }
                  })

            if (textbox.completeable.value.string === lastRecordedString) {
              recordBracketOrQuoteCompletion()
              return
            }

            textbox.history.record({
              string: textbox.completeable.value.string,
              selection: textbox.completeable.value.selection,
            })

            recordBracketOrQuoteCompletion()            
          }
        )
      })
    ]
  })

  return {
    segmentedBySelection
  }
}

type OpenBracketOrQuote = '[' | '(' | '{' | '<' | '"' | '\'' | '`'
type ClosedBrackedOrQuote = ']' | ')' | '}' | '>' | '"' | '\'' | '`'

function toClosedBracketOrQuote (openBracketOrQuote: OpenBracketOrQuote): ClosedBrackedOrQuote {
  switch (openBracketOrQuote) {
    case '[': return ']'
    case '(': return ')'
    case '{': return '}'
    case '<': return '>'
    case '"': return '"'
    case '\'': return '\''
    case '`': return '`'
  }
}
