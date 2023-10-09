import { watch } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { createKeycomboMatch } from '@baleada/logic'
import type { CompleteOptions } from '@baleada/logic'
import type { Textbox } from '../interfaces'
import { on } from '../affordances'
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
  segmentedBySpace: ReturnType<typeof useCompleteable>,
  segmentedByNewline: ReturnType<typeof useCompleteable>,
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
  checklist: (options?: CompleteOptions) => void,
  heading: (options?: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void,
  horizontalRule: (options?: CompleteOptions & { character?: '-' | '_' | '*' }) => void,
}

const defaultCompleteOptions: CompleteOptions = { select: 'completion' },
      defaultLinkOptions: Parameters<MarkdownEffects['link']>[0] = { select: 'href' },
      defaultUnorderedListOptions: Parameters<MarkdownEffects['unorderedList']>[0] = { bullet: '-', ...defaultCompleteOptions },
      defaultHeadingOptions: Parameters<MarkdownEffects['heading']>[0] = { level: 1, ...defaultCompleteOptions },
      defaultHorizontalRuleOptions: Parameters<MarkdownEffects['horizontalRule']>[0] = { character: '-', ...defaultCompleteOptions }

export function useMarkdownCompletion (textbox: Textbox): MarkdownCompletion {
  // TEXTBOX ACCESS
  const { root, text, history, record } = textbox


  // HISTORY
  const markdown = (segmentedBySpaceOrBlock: MarkdownCompletion['segmentedBySpace'] | MarkdownCompletion['segmentedByNewline']) => {
    const lastRecordedString = history.array[history.array.length - 1].string,
          recordNew = () => record({
            string: segmentedBySpaceOrBlock.string,
            selection: segmentedBySpaceOrBlock.selection,
          })

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
  }

  function symmetricalToggle (
    { punctuation, segmentedBySpaceOrBlock }: {
      punctuation: SymmetricalInlinePunctuation | SymmetricalInlinePunctuation,
      segmentedBySpaceOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toSymmetricalCompletion({ punctuation, segment: segmentedBySpaceOrBlock.segment })
    segmentedBySpaceOrBlock.complete(completion, options)
    markdown(segmentedBySpaceOrBlock)
  }
  
  function mappedToggle (
    { punctuation, segmentedBySpaceOrBlock }: {
      punctuation: MappedBlockPunctuation,
      segmentedBySpaceOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMappedCompletion({ punctuation, segment: segmentedBySpaceOrBlock.segment })
    segmentedBySpaceOrBlock.complete(completion, options)
    markdown(segmentedBySpaceOrBlock)
  }

  function mirroredToggle (
    { punctuation, segmentedBySpaceOrBlock }: {
      punctuation: MirroredBlockPunctuation,
      segmentedBySpaceOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMirroredCompletion({ punctuation, segment: segmentedBySpaceOrBlock.segment })
    segmentedBySpaceOrBlock.complete(completion, options)
    markdown(segmentedBySpaceOrBlock)
  }


  // INLINE
  const segmentedBySpace = useCompleteable(text.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold: MarkdownEffects['bold'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '**', segmentedBySpaceOrBlock: segmentedBySpace }, options),
        italic: MarkdownEffects['italic'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '_', segmentedBySpaceOrBlock: segmentedBySpace }, options),
        superscript: MarkdownEffects['superscript'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '^', segmentedBySpaceOrBlock: segmentedBySpace }, options),
        subscript: MarkdownEffects['subscript'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '~', segmentedBySpaceOrBlock: segmentedBySpace }, options),
        strikethrough: MarkdownEffects['strikethrough'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '~~', segmentedBySpaceOrBlock: segmentedBySpace }, options),
        code: MarkdownEffects['code'] = (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '`', segmentedBySpaceOrBlock: segmentedBySpace }, options),
        link: MarkdownEffects['link'] = (options = defaultLinkOptions) => {
          segmentedBySpace.complete(
            `[${segmentedBySpace.segment}]()`,
            options.select === 'href'
              ? {
                select: ({ before, completion }) => ({
                  // between parentheses
                  start: `${before}${completion}`.length - 1,
                  end: `${before}${completion}`.length - 1,
                  direction: 'forward',
                }),
              }
              : options as CompleteOptions
          )
          
          markdown(segmentedBySpace)
        }

  watch(
    () => text.string,
    () => segmentedBySpace.setString(text.string)
  )
    
  watch (
    () => text.selection,
    () => segmentedBySpace.setSelection(text.selection)
  )


  // BLOCK
  const segmentedByNewline = useCompleteable(text.string, { segment: { from: 'divider', to: 'divider' }, divider: /\n/m }),
        // TODO: select lang
        codeblock: MarkdownEffects['codeblock'] = (options = defaultCompleteOptions) => mirroredToggle({ punctuation: '```\n', segmentedBySpaceOrBlock: segmentedByNewline }, options),
        blockquote: MarkdownEffects['blockquote'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: '> ', segmentedBySpaceOrBlock: segmentedByNewline }, options),
        orderedList: MarkdownEffects['orderedList'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: index => `${index + 1}. `, segmentedBySpaceOrBlock: segmentedByNewline }, options),
        unorderedList: MarkdownEffects['unorderedList'] = (options = {}) => {
          const { bullet, ...completeOptions } = { ...defaultUnorderedListOptions, ...options }
          mappedToggle({ punctuation: `${bullet} `, segmentedBySpaceOrBlock: segmentedByNewline }, completeOptions)
        },
        checklist: MarkdownEffects['checklist'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: '- [] ', segmentedBySpaceOrBlock: segmentedByNewline }, options),
        heading: MarkdownEffects['heading'] = (options = {}) => {
          const { level, ...completeOptions } = { ...defaultHeadingOptions, ...options }
          segmentedByNewline.complete(toHeadingCompletion({ level, segment: segmentedByNewline.segment }), completeOptions)
          markdown(segmentedByNewline)
        },
        horizontalRule: MarkdownEffects['horizontalRule'] = (options = {}) => {
          const { character, ...completeOptions } = { ...defaultHorizontalRuleOptions, ...options }
          segmentedByNewline.complete(toHorizontalRuleCompletion({ character, segment: segmentedByNewline.segment }), completeOptions)
          markdown(segmentedByNewline)
        }

  watch(
    () => text.string,
    () => segmentedByNewline.setString(text.string)
  )
    
  watch (
    () => text.selection,
    () => segmentedByNewline.setSelection(text.selection)
  )

  on(
    root.element,
    {
      keydown: event => {
        if (createKeycomboMatch('enter')(event)) {
          if (segmentedByNewline.selection.end <= segmentedByNewline.dividerIndices.before + segmentedByNewline.segment.length) {
            if (checklistItemWithContentRE.test(segmentedByNewline.segment)) {
              event.preventDefault()

              const restOfSegment = segmentedByNewline.segment.slice(segmentedByNewline.selection.end - segmentedByNewline.dividerIndices.before - 1)
              segmentedByNewline.complete(`${segmentedByNewline.segment}\n- [] ${restOfSegment}`)
              markdown(segmentedByNewline)

              return
            }
            
            if (unorderedListItemWithContentRE.test(segmentedByNewline.segment)) {
              event.preventDefault()

              const restOfSegment = segmentedByNewline.segment.slice(segmentedByNewline.selection.end - segmentedByNewline.dividerIndices.before - 1)
              segmentedByNewline.complete(`${segmentedByNewline.segment}\n- ${restOfSegment}`)
              markdown(segmentedByNewline)

              return
            }
            
            if (orderedListItemWithContentRE.test(segmentedByNewline.segment)) {
              event.preventDefault()

              const restOfSegment = segmentedByNewline.segment.slice(segmentedByNewline.selection.end - segmentedByNewline.dividerIndices.before - 1),
                    index = Number(segmentedByNewline.segment.slice(0, 1))
              segmentedByNewline.complete(`${segmentedByNewline.segment}\n${index + 1}. ${restOfSegment}`)
              markdown(segmentedByNewline)

              return
            }

            return
          }

          if (
            checklistItemWithoutContentRE.test(segmentedByNewline.segment)
            || unorderedListItemWithoutContentRE.test(segmentedByNewline.segment)
            || orderedListItemWithoutContentRE.test(segmentedByNewline.segment)
          ) {
            event.preventDefault()
            segmentedByNewline.complete('')
            markdown(segmentedByNewline)
            return
          }

          if (checklistItemWithContentRE.test(segmentedByNewline.segment)) {
            event.preventDefault()
            segmentedByNewline.complete(`${segmentedByNewline.segment}\n- [] `)
            markdown(segmentedByNewline)
            return
          }
          
          if (unorderedListItemWithContentRE.test(segmentedByNewline.segment)) {
            event.preventDefault()
            segmentedByNewline.complete(`${segmentedByNewline.segment}\n- `)
            markdown(segmentedByNewline)
            return
          }
          
          if (orderedListItemWithContentRE.test(segmentedByNewline.segment)) {
            event.preventDefault()

            const index = Number(segmentedByNewline.segment.slice(0, 1))
            segmentedByNewline.complete(`${segmentedByNewline.segment}\n${index + 1}. `)
            markdown(segmentedByNewline)
            return
          }

          return
        }
      },
    }
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
    checklist,
    heading,
    horizontalRule,
  }

  return {
    segmentedBySpace,
    segmentedByNewline,
    ...markdownTextboxEffects,
  }
}

const orderedListItemWithContentRE = /^\d+\. .+$/,
      orderedListItemWithoutContentRE = /^\d+\. ?$/,
      unorderedListItemWithContentRE = /^- .+$/,
      unorderedListItemWithoutContentRE = /^- ?$/,
      checklistItemWithContentRE = /^- \[([Xx]|\s)?\] .+$/,
      checklistItemWithoutContentRE = /^- \[([Xx]|\s)?\] ?$/
