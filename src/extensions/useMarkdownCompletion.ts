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
  unorderedList: (options?: CompleteOptions) => void,
  heading: (options?: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void,
  horizontalRule: (options?: CompleteOptions) => void,
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
  const historyEffect = completeable => history.record({
    string: completeable.value.string,
    selection: completeable.value.selection,
  })

  function symmetricalToggle (
    { punctuation, completeable }: {
      punctuation: SymmetricalInlinePunctuation | SymmetricalInlinePunctuation,
      completeable: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toSymmetricalCompletion({ punctuation, segment: completeable.value.segment })
    completeable.value.complete(completion, options)
    historyEffect(completeable)
  }
  
  function mappedToggle (
    { punctuation, completeable }: {
      punctuation: MappedBlockPunctuation,
      completeable: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMappedCompletion({ punctuation, segment: completeable.value.segment })
    completeable.value.complete(completion, options)
    historyEffect(completeable)
  }

  function openingAndClosingToggle (
    { opening, closing, completeable }: {
      opening: OpeningBlockPunctuation,
      closing: ClosingBlockPunctuation,
      completeable: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toOpeningAndClosingCompletion({ opening, closing, segment: completeable.value.segment })
    completeable.value.complete(completion, options)
    historyEffect(completeable)
  }


  // INLINE
  const segmentedBySpace = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold: MarkdownEffects['bold'] = (options = defaultCompleteOptions) => {
          symmetricalToggle({ punctuation: '**', completeable: segmentedBySpace }, options)
        },
        italic: MarkdownEffects['italic'] = (options = defaultCompleteOptions) => {
          symmetricalToggle({ punctuation: '_', completeable: segmentedBySpace }, options)
        },
        superscript: MarkdownEffects['superscript'] = (options = defaultCompleteOptions) => {
          symmetricalToggle({ punctuation: '^', completeable: segmentedBySpace }, options)
        },
        subscript: MarkdownEffects['subscript'] = (options = defaultCompleteOptions) => {
          symmetricalToggle({ punctuation: '~', completeable: segmentedBySpace }, options)
        },
        strikethrough: MarkdownEffects['strikethrough'] = (options = defaultCompleteOptions) => {
          symmetricalToggle({ punctuation: '~~', completeable: segmentedBySpace }, options)
        },
        code: MarkdownEffects['code'] = (options = defaultCompleteOptions) => {
          symmetricalToggle({ punctuation: '`', completeable: segmentedBySpace }, options)
        },
        link: MarkdownEffects['link'] = (options = defaultCompleteOptions) => {
          segmentedBySpace.value.complete(`[${segmentedBySpace.value.segment}]()`, options)
          historyEffect(segmentedBySpace)
        }

  watch(
    () => completeable.value.string,
    () => segmentedBySpace.value.setString(completeable.value.string)
  )
    
  watch (
    () => completeable.value.selection,
    () => segmentedBySpace.value.setSelection(completeable.value.selection)
  )


  // BLOCK
  const segmentedByNewline = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\n/m }),
        codeblock: MarkdownEffects['codeblock'] = (options = defaultCompleteOptions) => {
          openingAndClosingToggle({ opening: '```\n', closing: '\n```', completeable: segmentedByNewline }, options)
        },
        blockquote: MarkdownEffects['blockquote'] = (options = defaultCompleteOptions) => {
          mappedToggle({ punctuation: '> ', completeable: segmentedByNewline }, options)
        },
        orderedList: MarkdownEffects['orderedList'] = (options = defaultCompleteOptions) => {
          mappedToggle({ punctuation: index => `${index + 1}. `, completeable: segmentedByNewline }, options)
        },
        unorderedList = (options: CompleteOptions & { bullet?: '-' | '*' } = {}) => {
          const { bullet, ...completeOptions } = { ...defaultCompleteOptions, ...options }
          mappedToggle({ punctuation: `${bullet || '-'} `, completeable: segmentedByNewline }, completeOptions)
        },
        heading = (options: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 } = {}) => {
          const { level, ...completeOptions } = { ...defaultCompleteOptions, ...options },
                hashes = (() => {
                  let hashes = ''

                  for (let i = 0; i < level; i++) {
                    hashes += '#'
                  }

                  return hashes
                })(),
                completion = segmentedByNewline.value.segment.startsWith(hashes)
                  ? segmentedByNewline.value.segment.slice(hashes.length)
                  : `${hashes} ${segmentedByNewline.value.segment}`
          
          segmentedByNewline.value.complete(completion, completeOptions)
          historyEffect(segmentedByNewline)
        },
        horizontalRule = (options?: CompleteOptions) => {
          segmentedByNewline.value.complete(`${segmentedByNewline.value.segment}${segmentedByNewline.value.segment.length > 0 ? '\n' : ''}---\n`, options)
          historyEffect(segmentedByNewline)
        }

  watch(
    () => completeable.value.string,
    () => segmentedByNewline.value.setString(completeable.value.string)
  )
    
  watch (
    () => completeable.value.selection,
    () => segmentedByNewline.value.setSelection(completeable.value.selection)
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
    inline: segmentedBySpace,
    block: segmentedByNewline,
    ...markdownTextboxEffects,
  }
}
