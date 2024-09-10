import { watch } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { createKeycomboMatch } from '@baleada/logic'
import { on } from '../affordances'
import type { Textbox } from '../interfaces'

export type ClosingCompletion = {
  close: <O extends Opening>(opening: O) => Closing<O>,
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
            string: segmentedBySelection.complete(
              `${opening}${segmentedBySelection.segment}${closing}`,
              { select: 'completion' }
            ).string,
            selection: {
              direction: segmentedBySelection.selection.direction,
              start: segmentedBySelection.selection.start + 1,
              end: segmentedBySelection.selection.end - 1,
            },
          })

          return closing
        },
        predicatesByOpening = (() => {
          const predicatesByOpening = [] as { opening: Opening, predicate: ReturnType<typeof createKeycomboMatch> }[]

          for (const opening of openings) {
            predicatesByOpening.push({ opening, predicate: createKeycomboMatch(opening) })
          }

          return predicatesByOpening
        })()

  watch(
    () => text.string,
    () => segmentedBySelection.string = text.string
  )

  watch(
    () => text.selection,
    () => segmentedBySelection.selection = text.selection
  )

  on(
    root.element,
    {
      keydown: event => {
        for (const { opening, predicate } of predicatesByOpening) {
          if (!predicate(event)) continue

          event.preventDefault()

          segmentedBySelection.string = text.string
          segmentedBySelection.selection = text.selection

          const lastRecordedString = history.array[history.array.length - 1].string,
                recordNew = () => close(opening)

          if (text.string === lastRecordedString) {
            recordNew()
            return
          }

          // Record previous
          record({
            string: text.string,
            selection: text.selection,
          })

          recordNew()

          return
        }
      },
    }
  )

  return {
    close,
    segmentedBySelection,
  }
}

type Opening = '[' | '(' | '{' | '<' | '"' | '\'' | '`'
type Closing<O extends Opening> = ClosingByOpening[O]
type ClosingByOpening = {
  '[': ']',
  '(': ')',
  '{': '}',
  '<': '>',
  '"': '"',
  '\'': '\'',
  '`': '`',
}
function toClosing <O extends Opening>(opening: O): Closing<O> {
  switch (opening) {
    case '[': return ']' as Closing<O>
    case '(': return ')' as Closing<O>
    case '{': return '}' as Closing<O>
    case '<': return '>' as Closing<O>
    case '"': return '"' as Closing<O>
    case '\'': return '\'' as Closing<O>
    case '`': return '`' as Closing<O>
  }
}
