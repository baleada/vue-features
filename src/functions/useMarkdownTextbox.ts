import { watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteOptions } from '@baleada/logic'
import { on } from '../affordances'
import { useTextbox } from './useTextbox'
import type { Textbox, UseTextboxOptions } from './useTextbox'

export type MarkdownTextbox = {
  inline: Ref<Completeable>,
  block: Ref<Completeable>,
} & Textbox & MarkdownTextboxEffects

type MarkdownTextboxEffects = {
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

export type UseMarkdownTextboxOptions = UseTextboxOptions & {
  shortcuts?: {
    event: string,
    effect: keyof MarkdownTextboxEffects | ((markdownTextboxEffects: MarkdownTextboxEffects) => any)
  }[], 
}

const defaultOptions: UseMarkdownTextboxOptions = {}

export function useMarkdownTextbox (options: UseMarkdownTextboxOptions = {}): MarkdownTextbox {
  const { shortcuts } = { ...defaultOptions, ...options }


  // INPUT
  const input = useTextbox(options),
        historyEffect = completeable => input.history.record({
          string: completeable.value.string,
          selection: completeable.value.selection,
        })


  // INLINE
  const inline = useCompleteable(input.completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold = (options?: CompleteOptions) => {
          inline.value.complete(`**${inline.value.segment}**`, options)
          historyEffect(inline)
        },
        italic = (options?: CompleteOptions) => {
          inline.value.complete(`_${inline.value.segment}_`, options)
          historyEffect(inline)
        },
        superscript = (options?: CompleteOptions) => {
          inline.value.complete(`^${inline.value.segment}^`, options)
          historyEffect(inline)
        },
        subscript = (options?: CompleteOptions) => {
          inline.value.complete(`~${inline.value.segment}~`, options)
          historyEffect(inline)
        },
        strikethrough = (options?: CompleteOptions) => {
          inline.value.complete(`~~${inline.value.segment}~~`, options)
          historyEffect(inline)
        },
        code = (options?: CompleteOptions) => {
          inline.value.complete(`\`${inline.value.segment}\``, options)
          historyEffect(inline)
        },
        link = (options?: CompleteOptions) => {
          inline.value.complete(`[${inline.value.segment}]()`, options)
          historyEffect(inline)
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
          historyEffect(block)
        },
        blockquote = (options?: CompleteOptions) => {
          block.value.complete(block.value.segment.split('\n').map(line => `> ${line}`).join('\n'), options)
          historyEffect(block)
        },
        orderedList = (options?: CompleteOptions) => {
          block.value.complete(block.value.segment.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n'), options)
          historyEffect(block)
        },
        unorderedList = (options?: CompleteOptions) => {
          block.value.complete(block.value.segment.split('\n').map(line => `- ${line}`).join('\n'), options)
          historyEffect(block)
        },
        heading = (options: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 } = { level: 1 }) => {
          const { level, ...completeableOptions } = options
          const hashes = (new Array(level)).fill(undefined).reduce(hashes => hashes + '#', '')
          block.value.complete(`${hashes} ${block.value.segment}`, completeableOptions)
          historyEffect(block)
        },
        horizontalRule = (options?: CompleteOptions) => {
          block.value.complete(`${block.value.segment}${block.value.segment.length > 0 ? '\n' : ''}---\n`, options)
          historyEffect(block)
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
  const markdownTextboxEffects: MarkdownTextboxEffects = {
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
      element: input.root.element,
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
    ...input,
    inline,
    block,
    ...markdownTextboxEffects,
  }
}
