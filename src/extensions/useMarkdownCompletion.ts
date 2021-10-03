import { watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { Completeable, CompleteOptions } from '@baleada/logic'
import type { Textbox } from '../interfaces'
import {
  toSymmetricalCompletion,
  toMappedCompletion,
  toMirroredCompletion,
  toHeadingCompletion,
  toHorizontalRuleCompletion,
} from '../extracted'
import type {
  SymmetricalInlinePunctuation,
  MappedBlockPunctuation,
  MirroredBlockPunctuation,
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
  link: (options?: { select?: CompleteOptions['select'] | 'href' }) => void,
  codeblock: (options?: CompleteOptions) => void,
  blockquote: (options?: CompleteOptions) => void,
  orderedList: (options?: CompleteOptions) => void,
  unorderedList: (options?: CompleteOptions & { bullet?: '-' | '*' }) => void,
  heading: (options?: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void,
  horizontalRule: (options?: CompleteOptions & { character?: '-' | '_' | '*' }) => void,
}

export type UseMarkdownTextboxOptions = Record<never, never>

const defaultCompleteOptions: CompleteOptions = { select: 'completion' },
      defaultLinkOptions: Parameters<MarkdownEffects['link']>[0] = { select: 'href' },
      defaultUnorderedListOptions: Parameters<MarkdownEffects['unorderedList']>[0] = { bullet: '-', ...defaultCompleteOptions },
      defaultHeadingOptions: Parameters<MarkdownEffects['heading']>[0] = { level: 1, ...defaultCompleteOptions },
      defaultHorizontalRuleOptions: Parameters<MarkdownEffects['horizontalRule']>[0] = { character: '-', ...defaultCompleteOptions }

export function useMarkdownCompletion (textbox: Textbox): MarkdownCompletion {
  // TEXTBOX ACCESS
  const { completeable, history } = textbox


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

  function mirroredToggle (
    { punctuation, inlineOrBlock }: {
      punctuation: MirroredBlockPunctuation,
      inlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMirroredCompletion({ punctuation, segment: inlineOrBlock.value.segment })
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
        link: MarkdownEffects['link'] = (options = defaultLinkOptions) => {
          inline.value.complete(
            `[${inline.value.segment}]()`,
            options.select === 'href' ? { select: 'completionEnd' } : options as CompleteOptions
          )

          if (options.select === 'href') {
            const betweenParentheses = inline.value.selection.end - 1

            inline.value.selection = {
              start: betweenParentheses,
              end: betweenParentheses,
              direction: 'forward',
            }
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
        codeblock: MarkdownEffects['codeblock'] = (options = defaultCompleteOptions) => mirroredToggle({ punctuation: '```\n', inlineOrBlock: block }, options),
        blockquote: MarkdownEffects['blockquote'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: '> ', inlineOrBlock: block }, options),
        orderedList: MarkdownEffects['orderedList'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: index => `${index + 1}. `, inlineOrBlock: block }, options),
        unorderedList: MarkdownEffects['unorderedList'] = (options = {}) => {
          const { bullet, ...completeOptions } = { ...defaultUnorderedListOptions, ...options }
          mappedToggle({ punctuation: `${bullet} `, inlineOrBlock: block }, completeOptions)
        },
        heading: MarkdownEffects['heading'] = (options = {}) => {
          const { level, ...completeOptions } = { ...defaultHeadingOptions, ...options }
          block.value.complete(toHeadingCompletion({ level, segment: block.value.segment }), completeOptions)
          markdown(block)
        },
        horizontalRule: MarkdownEffects['horizontalRule'] = (options = {}) => {
          const { character, ...completeOptions } = { ...defaultHorizontalRuleOptions, ...options }
          block.value.complete(toHorizontalRuleCompletion({ character, segment: block.value.segment }), completeOptions)
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

  return {
    inline,
    block,
    ...markdownTextboxEffects,
  }
}
