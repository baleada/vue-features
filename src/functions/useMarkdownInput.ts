import { watch } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteableOptions } from '@baleada/logic'
import { on } from '../affordances'
import { useInput } from './useInput'
import type { Input, UseInputOptions } from './useInput'

// TODO: import from Logic
type CompleteOptions = { select?: 'completion' | 'completionEnd' }

export type MarkdownInput = Input & MarkdownInputEffects

type MarkdownInputEffects = {
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

export type UseMarkdownInputOptions = UseInputOptions & {
  shortcuts?: {
    event: string,
    effect: keyof MarkdownInputEffects | ((markdownInputEffects: MarkdownInputEffects) => any)
  }[], 
}

const defaultOptions: UseMarkdownInputOptions = {}

export function useMarkdownInput (options: UseMarkdownInputOptions = {}): MarkdownInput {
  const { shortcuts } = { ...defaultOptions, ...options }


  // INPUT
  const input = useInput(options),
        completeEffect = c => input.completeable.value.setString(c.value.string).setSelection(c.value.selection)


  // INLINE
  const inline = useCompleteable(input.completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold = (options?: CompleteOptions) => {
          inline.value.complete(`**${inline.value.segment}**`, options)
          completeEffect(inline)
        },
        italic = (options?: CompleteOptions) => {
          inline.value.complete(`_${inline.value.segment}_`, options)
          completeEffect(inline)
        },
        superscript = (options?: CompleteOptions) => {
          inline.value.complete(`^${inline.value.segment}^`, options)
          completeEffect(inline)
        },
        subscript = (options?: CompleteOptions) => {
          inline.value.complete(`~${inline.value.segment}~`, options)
          completeEffect(inline)
        },
        strikethrough = (options?: CompleteOptions) => {
          inline.value.complete(`~~${inline.value.segment}~~`, options)
          completeEffect(inline)
        },
        code = (options?: CompleteOptions) => {
          inline.value.complete(`\`${inline.value.segment}\``, options)
          completeEffect(inline)
        },
        link = (options?: CompleteOptions) => {
          inline.value.complete(`[${inline.value.segment}]()`, options)
          completeEffect(inline)
        }

  watch(
    () => input.completeable.value.string,
    () => inline.value.setString(input.completeable.value.string)
  )
    
  watch (
    () => input.completeable.value.selection,
    () => inline.value.setSelection(input.completeable.value.selection)
  )


  // BLOCK
  const block = useCompleteable(input.completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\n/m }),
        codeblock = (options?: CompleteOptions) => {
          block.value.complete(`\`\`\`\n${block.value.segment}\n\`\`\``, options)
          completeEffect(block)
        },
        blockquote = (options?: CompleteOptions) => {
          block.value.complete(block.value.segment.split('\n').map(line => `> ${line}`).join('\n'), options)
          completeEffect(block)
        },
        orderedList = (options?: CompleteOptions) => {
          block.value.complete(block.value.segment.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n'), options)
          completeEffect(block)
        },
        unorderedList = (options?: CompleteOptions) => {
          block.value.complete(block.value.segment.split('\n').map(line => `- ${line}`).join('\n'), options)
          completeEffect(block)
        },
        heading = (options: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 } = { level: 1 }) => {
          const { level, ...completeableOptions } = options
          const hashes = (new Array(level)).fill(undefined).reduce(hashes => hashes + '#', '')
          block.value.complete(`${hashes} ${block.value.segment}`, completeableOptions)
          completeEffect(block)
        },
        horizontalRule = (options?: CompleteOptions) => {
          block.value.complete(`${block.value.segment}${block.value.segment.length > 0 ? '\n' : ''}---\n`, options)
          completeEffect(block)
        }

  watch(
    () => input.completeable.value.string,
    () => block.value.setString(input.completeable.value.string)
  )
    
  watch (
    () => input.completeable.value.selection,
    () => block.value.setSelection(input.completeable.value.selection)
  )
  

  // API
  const markdownInputEffects: MarkdownInputEffects = {
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
        },
        markdownInput = {
          ...input,
          inline,
          block,
          ...markdownInputEffects,
        }

  if (shortcuts) {
    on({
      target: input.element.el,
      events: shortcuts.reduce((events, { event, effect }) => ({
        ...events,
        [event]: (e: KeyboardEvent) => {
          e.preventDefault()

          if (typeof effect === 'function') {
            effect(markdownInputEffects)
            return
          }

          markdownInputEffects[effect]()
        }
      }), {})
    })
  }

  return markdownInput
}
