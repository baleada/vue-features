import { watch, } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { CompleteOptions } from '@baleada/logic'
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
  selected: { completeable: ReturnType<typeof useCompleteable> } & InlineEffects,
  inline: { completeable: ReturnType<typeof useCompleteable> } & InlineEffects,
  block: { completeable: ReturnType<typeof useCompleteable> } & BlockEffects,
}

type MarkdownEffects = InlineEffects & BlockEffects

type InlineEffects = {
  bold: (options?: CompleteOptions) => void,
  italic: (options?: CompleteOptions) => void,
  superscript: (options?: CompleteOptions) => void,
  subscript: (options?: CompleteOptions) => void,
  strikethrough: (options?: CompleteOptions) => void,
  code: (options?: CompleteOptions) => void,
  link: (options?: { select?: CompleteOptions['select'] | 'href' }) => void,
}

type BlockEffects = {
  codeblock: (options?: CompleteOptions) => void,
  blockquote: (options?: CompleteOptions) => void,
  orderedList: (options?: CompleteOptions) => void,
  unorderedList: (options?: CompleteOptions & { bullet?: '-' | '*' }) => void,
  checklist: (options?: CompleteOptions) => void,
  heading: (options?: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void,
  horizontalRule: (options?: CompleteOptions & { character?: '-' | '_' | '*' }) => void,
}

export type UseMarkdownCompletionOptions = Record<never, never>

const defaultCompleteOptions: CompleteOptions = { select: 'completion' },
      defaultLinkOptions: Parameters<MarkdownEffects['link']>[0] = { select: 'href' },
      defaultUnorderedListOptions: Parameters<MarkdownEffects['unorderedList']>[0] = { bullet: '-', ...defaultCompleteOptions },
      defaultHeadingOptions: Parameters<MarkdownEffects['heading']>[0] = { level: 1, ...defaultCompleteOptions },
      defaultHorizontalRuleOptions: Parameters<MarkdownEffects['horizontalRule']>[0] = { character: '-', ...defaultCompleteOptions }

export function useMarkdownCompletion (textbox: Textbox): MarkdownCompletion {
  // TEXTBOX ACCESS
  const { root, completeable, history } = textbox


  // HISTORY
  const markdown = (selectedOrInlineOrBlock: MarkdownCompletion['selected']['completeable'] | MarkdownCompletion['inline']['completeable'] | MarkdownCompletion['block']['completeable']) => {
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


  // CREATE EFFECTS
  function createEffect<Effect extends keyof MarkdownEffects> (name: Effect, selectedOrInlineOrBlock: ReturnType<typeof useCompleteable>): MarkdownEffects[Effect] {
    switch (name) {
      case 'bold':
        return (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '**', selectedOrInlineOrBlock }, options)
      case 'italic':
        return (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '_', selectedOrInlineOrBlock }, options)
      case 'superscript':
        return (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '^', selectedOrInlineOrBlock }, options)
      case 'subscript':
        return (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '~', selectedOrInlineOrBlock }, options)
      case 'strikethrough':
        return (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '~~', selectedOrInlineOrBlock }, options)
      case 'code':
        return (options = defaultCompleteOptions) => symmetricalToggle({ punctuation: '`', selectedOrInlineOrBlock }, options)
      case 'link':
        return (options = defaultLinkOptions) => {
          selectedOrInlineOrBlock.value.complete(
            `[${selectedOrInlineOrBlock.value.segment}]()`,
            options.select === 'href' ? { select: 'completionEnd' } : options as CompleteOptions
          )

          if (options.select === 'href') {
            const betweenParentheses = selectedOrInlineOrBlock.value.selection.end - 1

            selectedOrInlineOrBlock.value.selection = {
              start: betweenParentheses,
              end: betweenParentheses,
              direction: 'forward',
            }
          }
          
          markdown(selectedOrInlineOrBlock)
        }
      case 'codeblock':
        return (options = defaultCompleteOptions) => mirroredToggle({ punctuation: '```\n', selectedOrInlineOrBlock }, options)
      case 'blockquote':
        return (options = defaultCompleteOptions) => mappedToggle({ punctuation: '> ', selectedOrInlineOrBlock }, options)
      case 'orderedList':
        return (options = defaultCompleteOptions) => mappedToggle({ punctuation: index => `${index + 1}. `, selectedOrInlineOrBlock }, options)
      case 'unorderedList':
        return (options = {}) => {
          const { bullet, ...completeOptions } = { ...defaultUnorderedListOptions, ...options }
          mappedToggle({ punctuation: `${bullet} `, selectedOrInlineOrBlock }, completeOptions)
        }
      case 'checklist':
        return (options = defaultCompleteOptions) => mappedToggle({ punctuation: '- [] ', selectedOrInlineOrBlock }, options)
      case 'heading':
        return (options = {}) => {
          const { level, ...completeOptions } = { ...defaultHeadingOptions, ...options }
          block.value.complete(toHeadingCompletion({ level, segment: block.value.segment }), completeOptions)
          markdown(block)
        }
      case 'horizontalRule':
        return (options = {}) => {
          const { character, ...completeOptions } = { ...defaultHorizontalRuleOptions, ...options }
          block.value.complete(toHorizontalRuleCompletion({ character, segment: block.value.segment }), completeOptions)
          markdown(block)
        }
    }
  }
  


  // SELECTED
  const selected: MarkdownCompletion['selected']['completeable'] = useCompleteable(completeable.value.string, { segment: { from: 'selection', to: 'selection' } }),
        selectedEffects = {
          bold: createEffect('bold', selected),
          italic: createEffect('italic', selected),
          superscript: createEffect('superscript', selected),
          subscript: createEffect('subscript', selected),
          strikethrough: createEffect('strikethrough', selected),
          code: createEffect('code', selected),
          link: createEffect('link', selected),
        }

  watch(
    () => completeable.value.string,
    () => selected.value.setString(completeable.value.string)
  )
    
  watch (
    () => completeable.value.selection,
    () => selected.value.setSelection(completeable.value.selection)
  )


  // INLINE
  const inline = useCompleteable(completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        inlineEffects = {
          bold: createEffect('bold', inline),
          italic: createEffect('italic', inline),
          superscript: createEffect('superscript', inline),
          subscript: createEffect('subscript', inline),
          strikethrough: createEffect('strikethrough', inline),
          code: createEffect('code', inline),
          link: createEffect('link', inline),
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
        // TODO: select lang
        blockEffects = {
          codeblock: createEffect('codeblock', block),
          blockquote: createEffect('blockquote', block),
          orderedList: createEffect('orderedList', block),
          unorderedList: createEffect('unorderedList', block),
          checklist: createEffect('checklist', block),
          heading: createEffect('heading', block),
          horizontalRule: createEffect('horizontalRule', block),
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
            if (checklistItemWithContentRE.test(block.value.segment)) {
              event.preventDefault()

              const restOfSegment = block.value.segment.slice(block.value.selection.end - block.value.dividerIndices.before - 1)
              block.value.complete(`${block.value.segment}\n- [] ${restOfSegment}`)
              markdown(block)

              return
            }
            
            if (unorderedListItemWithContentRE.test(block.value.segment)) {
              event.preventDefault()

              const restOfSegment = block.value.segment.slice(block.value.selection.end - block.value.dividerIndices.before - 1)
              block.value.complete(`${block.value.segment}\n- ${restOfSegment}`)
              markdown(block)

              return
            }
            
            if (orderedListItemWithContentRE.test(block.value.segment)) {
              event.preventDefault()

              const restOfSegment = block.value.segment.slice(block.value.selection.end - block.value.dividerIndices.before - 1),
                    index = Number(block.value.segment.slice(0, 1))
              block.value.complete(`${block.value.segment}\n${index + 1}. ${restOfSegment}`)
              markdown(block)

              return
            }

            return
          }

          if (
            checklistItemWithoutContentRE.test(block.value.segment)
            || unorderedListItemWithoutContentRE.test(block.value.segment)
            || orderedListItemWithoutContentRE.test(block.value.segment)
          ) {
            event.preventDefault()
            block.value.complete('')
            markdown(block)
            return
          }

          if (checklistItemWithContentRE.test(block.value.segment)) {
            event.preventDefault()
            block.value.complete(`${block.value.segment}\n- [] `)
            markdown(block)
            return
          }
          
          if (unorderedListItemWithContentRE.test(block.value.segment)) {
            event.preventDefault()
            block.value.complete(`${block.value.segment}\n- `)
            markdown(block)
            return
          }
          
          if (orderedListItemWithContentRE.test(block.value.segment)) {
            event.preventDefault()

            const index = Number(block.value.segment.slice(0, 1))
            block.value.complete(`${block.value.segment}\n${index + 1}. `)
            markdown(block)
            return
          }
        },
      ),
    ]
  })
  

  // API
  return {
    selected: {
      completeable: selected,
      ...selectedEffects,
    },
    inline: {
      completeable: inline,
      ...inlineEffects,
    },
    block: {
      completeable: block,
      ...blockEffects,
    },
  }
}

const orderedListItemWithContentRE = /^\d+\. .+$/,
      orderedListItemWithoutContentRE = /^\d+\. ?$/,
      unorderedListItemWithContentRE = /^- .+$/,
      unorderedListItemWithoutContentRE = /^- ?$/,
      checklistItemWithContentRE = /^- \[([Xx]|\s)?\] .+$/,
      checklistItemWithoutContentRE = /^- \[([Xx]|\s)?\] ?$/
