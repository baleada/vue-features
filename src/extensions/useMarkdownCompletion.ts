import { watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteOptions } from '@baleada/logic'
import { on } from '../affordances'
import { Textbox } from '../interfaces'
import {
  toSymmetricalCompletion,
  toMappedCompletion,
  toOpeningAndClosingCompletion,
} from '../extracted'
import type {
  SymmetricalInlinePunctuation,
  MappedBlockPunctuation,
  OpeningBlockPunctuation,
  ClosingBlockPunctuation,
} from '../extracted'

export type MarkdownCompletion = {
  inline: Ref<Completeable>,
  block: Ref<Completeable>,
} & MarkdownEffects

type MarkdownEffects = {
  bold: (options?: CompleteOptions) => void,
  italic: (options?: CompleteOptions) => void,
  superscript: (options?: CompleteOptions) => void,
  subscript: (options?: CompleteOptions) => void,
  strikethrough: (options?: CompleteOptions) => void,
  code: (options?: CompleteOptions) => void,
  link: (options?: CompleteOptions) => void,
  codeblock: (options?: CompleteOptions) => void,
  blockquote: (options?: CompleteOptions) => void,
  orderedList: (options?: CompleteOptions) => void,
  unorderedList: (options?: CompleteOptions & { bullet?: '-' | '*' }) => void,
  heading: (options?: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void,
  horizontalRule: (options?: CompleteOptions & { character?: '-' | '_' | '*' }) => void,
}

export type UseMarkdownTextboxOptions = {
  shortcuts?: {
    event: string,
    effect: keyof MarkdownEffects | ((markdownTextboxEffects: MarkdownEffects) => any)
  }[], 
}

const defaultOptions: UseMarkdownTextboxOptions = {}
const defaultCompleteOptions: CompleteOptions = {
  select: 'completion'
}

export function useMarkdownCompletion (textbox: Textbox, options: UseMarkdownTextboxOptions = {}): MarkdownCompletion {
  const { shortcuts } = { ...defaultOptions, ...options }


  // TEXTBOX ACCESS
  const { root, completeable, history } = textbox


  // HISTORY
  const markdown = (inlineOrBlock: MarkdownCompletion['inline'] | MarkdownCompletion['block']) => {
    const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
          recordNew = () => history.record({
            string: inlineOrBlock.value.string,
            selection: inlineOrBlock.value.selection,
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

  function symmetricalToggle (
    { punctuation, inlineOrBlock }: {
      punctuation: SymmetricalInlinePunctuation | SymmetricalInlinePunctuation,
      inlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toSymmetricalCompletion({ punctuation, segment: inlineOrBlock.value.segment })
    inlineOrBlock.value.complete(completion, options)
    markdown(inlineOrBlock)
  }
  
  function mappedToggle (
    { punctuation, inlineOrBlock }: {
      punctuation: MappedBlockPunctuation,
      inlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMappedCompletion({ punctuation, segment: inlineOrBlock.value.segment })
    inlineOrBlock.value.complete(completion, options)
    markdown(inlineOrBlock)
  }

  function openingAndClosingToggle (
    { opening, closing, inlineOrBlock }: {
      opening: OpeningBlockPunctuation,
      closing: ClosingBlockPunctuation,
      inlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toOpeningAndClosingCompletion({ opening, closing, segment: inlineOrBlock.value.segment })
    inlineOrBlock.value.complete(completion, options)
    markdown(inlineOrBlock)
  }


  // INLINE
  const inline = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold: MarkdownEffects['bold'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '**', inlineOrBlock: inline }, options),
        italic: MarkdownEffects['italic'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '_', inlineOrBlock: inline }, options),
        superscript: MarkdownEffects['superscript'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '^', inlineOrBlock: inline }, options),
        subscript: MarkdownEffects['subscript'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '~', inlineOrBlock: inline }, options),
        strikethrough: MarkdownEffects['strikethrough'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '~~', inlineOrBlock: inline }, options),
        code: MarkdownEffects['code'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '`', inlineOrBlock: inline }, options),
        link: MarkdownEffects['link'] = (options = defaultCompleteOptions) => {
          const betweenParentheses = inline.value.dividerIndices.after - 1 + '[]('.length

          inline.value.complete(`[${inline.value.segment}]()`, options)
          inline.value.selection = {
            start: betweenParentheses,
            end: betweenParentheses,
            direction: 'forward',
          }
          markdown(inline)
        }

  watch(
    () => completeable.value.string,
    () => inline.value.setString(completeable.value.string)
  )
    
  watch (
    () => completeable.value.selection,
    () => inline.value.setSelection(completeable.value.selection)
  )


  // BLOCK
  const block = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\n/m }),
        codeblock: MarkdownEffects['codeblock'] = (options = defaultCompleteOptions) => openingAndClosingToggle({ opening: '```\n', closing: '\n```', inlineOrBlock: block }, options),
        blockquote: MarkdownEffects['blockquote'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: '> ', inlineOrBlock: block }, options),
        orderedList: MarkdownEffects['orderedList'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: index => `${index + 1}. `, inlineOrBlock: block }, options),
        unorderedList: MarkdownEffects['unorderedList'] = (options = {}) => {
          const { bullet = '-', ...completeOptions } = { ...defaultCompleteOptions, ...options }
          mappedToggle({ punctuation: `${bullet} `, inlineOrBlock: block }, completeOptions)
        },
        heading: MarkdownEffects['heading'] = (options = {}) => {
          const { level = 1, ...completeOptions } = { ...defaultCompleteOptions, ...options },
                hashes = (() => {
                  let hashes = ''

                  for (let i = 0; i < level; i++) {
                    hashes += '#'
                  }

                  return hashes
                })(),
                completion = block.value.segment.startsWith(hashes)
                  ? block.value.segment.slice(hashes.length)
                  : `${hashes} ${block.value.segment}`
          
          block.value.complete(completion, completeOptions)
          markdown(block)
        },
        horizontalRule: MarkdownEffects['horizontalRule'] = (options = {}) => {
          const { character = '-', ...completeOptions } = { ...defaultCompleteOptions, ...options },
                nextLineStart = (() => {
                  if (
                    block.value.segment.length === 0
                    || block.value.dividerIndices.after === block.value.string.length + 1
                  ) {
                    return block.value.dividerIndices.after
                  }

                  return block.value.dividerIndices.after + 1
                })()

          block.value.complete(`${block.value.segment}${block.value.segment.length > 0 ? '\n' : ''}${character}${character}${character}\n`, completeOptions)
          block.value.selection = {
            start: nextLineStart + '---\n'.length,
            end: nextLineStart + '---\n'.length,
            direction: 'forward',
          }

          markdown(block)
        }

  watch(
    () => completeable.value.string,
    () => block.value.setString(completeable.value.string)
  )
    
  watch (
    () => completeable.value.selection,
    () => block.value.setSelection(completeable.value.selection)
  )
  

  // API
  const markdownTextboxEffects: MarkdownEffects = {
    bold,
    italic,
    superscript,
    subscript,
    strikethrough,
    code,
    link,
    codeblock,
    blockquote,
    orderedList,
    unorderedList,
    heading,
    horizontalRule,
  }

  if (shortcuts) {
    on({
      element: root.element,
      effects: shortcuts.reduce((events, { event, effect }) => ({
        ...events,
        [event]: (e: KeyboardEvent) => {
          e.preventDefault()

          if (typeof effect === 'function') {
            effect(markdownTextboxEffects)
            return
          }

          markdownTextboxEffects[effect]()
        }
      }), {})
    })
  }

  return {
    inline,
    block,
    ...markdownTextboxEffects,
  }
}
