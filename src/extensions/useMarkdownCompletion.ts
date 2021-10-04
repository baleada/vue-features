import { watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { Completeable, CompleteableOptions, CompleteOptions, Pipeable } from '@baleada/logic'
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
  selected: Ref<Completeable>,
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
  // TODO: Autocomplete next list item on line break
  orderedList: (options?: CompleteOptions) => void,
  unorderedList: (options?: CompleteOptions & { bullet?: '-' | '*' }) => void,
  checklist: (options?: CompleteOptions) => void,
  heading: (options?: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void,
  horizontalRule: (options?: CompleteOptions & { character?: '-' | '_' | '*' }) => void,
}

export type UseMarkdownCompletionOptions = {
  toCompleteableName?: (inlineSegment: string) => 'selected' | 'inline',
}

const defaultOptons: UseMarkdownCompletionOptions = {
        toCompleteableName: () => 'inline',
      },
      defaultCompleteOptions: CompleteOptions = { select: 'completion' },
      defaultLinkOptions: Parameters<MarkdownEffects['link']>[0] = { select: 'href' },
      defaultUnorderedListOptions: Parameters<MarkdownEffects['unorderedList']>[0] = { bullet: '-', ...defaultCompleteOptions },
      defaultHeadingOptions: Parameters<MarkdownEffects['heading']>[0] = { level: 1, ...defaultCompleteOptions },
      defaultHorizontalRuleOptions: Parameters<MarkdownEffects['horizontalRule']>[0] = { character: '-', ...defaultCompleteOptions }

export function useMarkdownCompletion (textbox: Textbox, options: UseMarkdownCompletionOptions = {}): MarkdownCompletion {
  const { toCompleteableName } = { ...defaultOptons, ...options }

  // TEXTBOX ACCESS
  const { root, completeable, history } = textbox


  // HISTORY
  const markdown = (selectedOrInlineOrBlock: MarkdownCompletion['inline'] | MarkdownCompletion['block']) => {
    const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
          recordNew = () => history.record({
            string: selectedOrInlineOrBlock.value.string,
            selection: selectedOrInlineOrBlock.value.selection,
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
    { punctuation, selectedOrInlineOrBlock }: {
      punctuation: SymmetricalInlinePunctuation | SymmetricalInlinePunctuation,
      selectedOrInlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toSymmetricalCompletion({ punctuation, segment: selectedOrInlineOrBlock.value.segment })
    selectedOrInlineOrBlock.value.complete(completion, options)
    markdown(selectedOrInlineOrBlock)
  }
  
  function mappedToggle (
    { punctuation, selectedOrInlineOrBlock }: {
      punctuation: MappedBlockPunctuation,
      selectedOrInlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMappedCompletion({ punctuation, segment: selectedOrInlineOrBlock.value.segment })
    selectedOrInlineOrBlock.value.complete(completion, options)
    markdown(selectedOrInlineOrBlock)
  }

  function mirroredToggle (
    { punctuation, selectedOrInlineOrBlock }: {
      punctuation: MirroredBlockPunctuation,
      selectedOrInlineOrBlock: ReturnType<typeof useCompleteable>,
    },
    options?: CompleteOptions
  ) {
    const completion = toMirroredCompletion({ punctuation, segment: selectedOrInlineOrBlock.value.segment })
    selectedOrInlineOrBlock.value.complete(completion, options)
    markdown(selectedOrInlineOrBlock)
  }


  // INLINE
  const selected = useCompleteable(completeable.value.string, { segment: { from: 'selection', to: 'selection' } }),
        inline = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        toInstance = (name: ReturnType<UseMarkdownCompletionOptions['toCompleteableName']>) => {
          switch (name) {
            case 'selected':
              return selected
            case 'inline':
              return inline
          }
        },
        bold: MarkdownEffects['bold'] = (options = defaultCompleteOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>
          symmetricalToggle({ punctuation: '**', selectedOrInlineOrBlock: instance }, options)
        },
        italic: MarkdownEffects['italic'] = (options = defaultCompleteOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>
          symmetricalToggle({ punctuation: '_', selectedOrInlineOrBlock: instance }, options)
        },
        superscript: MarkdownEffects['superscript'] = (options = defaultCompleteOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>
          symmetricalToggle({ punctuation: '^', selectedOrInlineOrBlock: instance }, options)
        },
        subscript: MarkdownEffects['subscript'] = (options = defaultCompleteOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>
          symmetricalToggle({ punctuation: '~', selectedOrInlineOrBlock: instance }, options)
        },
        strikethrough: MarkdownEffects['strikethrough'] = (options = defaultCompleteOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>
          symmetricalToggle({ punctuation: '~~', selectedOrInlineOrBlock: instance }, options)
        },
        code: MarkdownEffects['code'] = (options = defaultCompleteOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>
          symmetricalToggle({ punctuation: '`', selectedOrInlineOrBlock: instance }, options)
        },
        link: MarkdownEffects['link'] = (options = defaultLinkOptions) => {
          const instance = new Pipeable(inline.value.segment).pipe(toCompleteableName, toInstance) as ReturnType<typeof useCompleteable>

          instance.value.complete(
            `[${instance.value.segment}]()`,
            options.select === 'href' ? { select: 'completionEnd' } : options as CompleteOptions
          )

          if (options.select === 'href') {
            const betweenParentheses = instance.value.selection.end - 1

            instance.value.selection = {
              start: betweenParentheses,
              end: betweenParentheses,
              direction: 'forward',
            }
          }
          
          markdown(instance)
        }

  watch(
    () => completeable.value.string,
    () => {
      selected.value.setString(completeable.value.string)
      inline.value.setString(completeable.value.string)
    }
  )
    
  watch (
    () => completeable.value.selection,
    () => {
      selected.value.setSelection(completeable.value.selection)
      inline.value.setSelection(completeable.value.selection)
    }
  )


  // BLOCK
  const block = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\n/m }),
        // TODO: select lang
        codeblock: MarkdownEffects['codeblock'] = (options = defaultCompleteOptions) => mirroredToggle({ punctuation: '```\n', selectedOrInlineOrBlock: block }, options),
        blockquote: MarkdownEffects['blockquote'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: '> ', selectedOrInlineOrBlock: block }, options),
        orderedList: MarkdownEffects['orderedList'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: index => `${index + 1}. `, selectedOrInlineOrBlock: block }, options),
        unorderedList: MarkdownEffects['unorderedList'] = (options = {}) => {
          const { bullet, ...completeOptions } = { ...defaultUnorderedListOptions, ...options }
          mappedToggle({ punctuation: `${bullet} `, selectedOrInlineOrBlock: block }, completeOptions)
        },
        checklist: MarkdownEffects['checklist'] = (options = defaultCompleteOptions) => mappedToggle({ punctuation: '- [] ', selectedOrInlineOrBlock: block }, options),
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

  on<'!shift+!cmd+!ctrl+!opt+enter'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        '!shift+!cmd+!ctrl+!opt+enter',
        event => {
          if (block.value.selection.end <= block.value.dividerIndices.before + block.value.segment.length) {
            if (checklistItemRE.test(block.value.segment)) {
              event.preventDefault()

              const restOfSegment = block.value.segment.slice(block.value.selection.end - block.value.dividerIndices.before - 1)

              block.value.complete(`${block.value.segment}\n`)
              checklist({ select: 'completionEnd' })
              nextTick(() => block.value.complete(`${block.value.segment}${restOfSegment}`))

              return
            }
            
            if (unorderedListItemRE.test(block.value.segment)) {
              event.preventDefault()

              const restOfSegment = block.value.segment.slice(block.value.selection.end - block.value.dividerIndices.before - 1)

              block.value.complete(`${block.value.segment}\n`)
              unorderedList({ select: 'completionEnd' })
              nextTick(() => block.value.complete(`${block.value.segment}${restOfSegment}`))

              return
            }
            
            if (orderedListItemRE.test(block.value.segment)) {
              event.preventDefault()

              const restOfSegment = block.value.segment.slice(block.value.selection.end - block.value.dividerIndices.before - 1)

              block.value.complete(`${block.value.segment}\n`)
              orderedList({ select: 'completionEnd' })
              nextTick(() => block.value.complete(`${block.value.segment}${restOfSegment}`))

              return
            }

            return
          }

          if (checklistItemRE.test(block.value.segment)) {
            event.preventDefault()
            block.value.complete(`${block.value.segment}\n`)
            checklist({ select: 'completionEnd' })
            return
          }
          
          if (unorderedListItemRE.test(block.value.segment)) {
            event.preventDefault()
            block.value.complete(`${block.value.segment}\n`)
            unorderedList({ select: 'completionEnd' })
            return
          }
          
          if (orderedListItemRE.test(block.value.segment)) {
            event.preventDefault()
            block.value.complete(`${block.value.segment}\n`)
            orderedList({ select: 'completionEnd' })
            return
          }
        },
      ),
    ]
  })
  

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
    selected,
    inline,
    block,
    ...markdownTextboxEffects,
  }
}

const orderedListItemRE = /(^\d+\. |^\d+\.$)/,
      unorderedListItemRE = /(^- |^-$)/,
      checklistItemRE = /(^- \[([Xx]|\s)?\] |^- \[([Xx]|\s)?\]$)/
