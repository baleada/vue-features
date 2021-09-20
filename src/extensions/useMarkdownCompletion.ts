import { watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteOptions } from '@baleada/logic'
import { on } from '../affordances'
import type { Textbox } from '../functions'

export type MarkdownCompletion = {
  segmentedBySpace: Ref<Completeable>,
  segmentedByNewline: Ref<Completeable>,
} & MarkdownTextboxEffects

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

export type UseMarkdownTextboxOptions = {
  shortcuts?: {
    event: string,
    effect: keyof MarkdownTextboxEffects | ((markdownTextboxEffects: MarkdownTextboxEffects) => any)
  }[], 
}

const defaultOptions: UseMarkdownTextboxOptions = {}

export function useMarkdownTextbox<StoreableKey extends string> (textbox: Textbox<StoreableKey>, options: UseMarkdownTextboxOptions = {}): MarkdownCompletion {
  const { shortcuts } = { ...defaultOptions, ...options }


  // HISTORY
  const historyEffect = completeable => textbox.history.record({
    string: completeable.value.string,
    selection: completeable.value.selection,
  })


  // INLINE
  const segmentedBySpace = useCompleteable(textbox.completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`**${segmentedBySpace.value.segment}**`, options)
          historyEffect(segmentedBySpace)
        },
        italic = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`_${segmentedBySpace.value.segment}_`, options)
          historyEffect(segmentedBySpace)
        },
        superscript = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`^${segmentedBySpace.value.segment}^`, options)
          historyEffect(segmentedBySpace)
        },
        subscript = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`~${segmentedBySpace.value.segment}~`, options)
          historyEffect(segmentedBySpace)
        },
        strikethrough = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`~~${segmentedBySpace.value.segment}~~`, options)
          historyEffect(segmentedBySpace)
        },
        code = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`\`${segmentedBySpace.value.segment}\``, options)
          historyEffect(segmentedBySpace)
        },
        link = (options?: CompleteOptions) => {
          segmentedBySpace.value.complete(`[${segmentedBySpace.value.segment}]()`, options)
          historyEffect(segmentedBySpace)
        }

  watch(
    () => textbox.completeable.value.string,
    () => segmentedBySpace.value.setString(textbox.completeable.value.string)
  )
    
  watch (
    () => textbox.completeable.value.selection,
    () => segmentedBySpace.value.setSelection(textbox.completeable.value.selection)
  )


  // BLOCK
  const segmentedByNewline = useCompleteable(textbox.completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\n/m }),
        codeblock = (options?: CompleteOptions) => {
          segmentedByNewline.value.complete(`\`\`\`\n${segmentedByNewline.value.segment}\n\`\`\``, options)
          historyEffect(segmentedByNewline)
        },
        blockquote = (options?: CompleteOptions) => {
          segmentedByNewline.value.complete(segmentedByNewline.value.segment.split('\n').map(line => `> ${line}`).join('\n'), options)
          historyEffect(segmentedByNewline)
        },
        orderedList = (options?: CompleteOptions) => {
          segmentedByNewline.value.complete(segmentedByNewline.value.segment.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n'), options)
          historyEffect(segmentedByNewline)
        },
        unorderedList = (options?: CompleteOptions) => {
          segmentedByNewline.value.complete(segmentedByNewline.value.segment.split('\n').map(line => `- ${line}`).join('\n'), options)
          historyEffect(segmentedByNewline)
        },
        heading = (options: CompleteOptions & { level?: 1 | 2 | 3 | 4 | 5 | 6 } = { level: 1 }) => {
          const { level, ...completeableOptions } = options
          const hashes = (new Array(level)).fill(undefined).reduce(hashes => hashes + '#', '')
          segmentedByNewline.value.complete(`${hashes} ${segmentedByNewline.value.segment}`, completeableOptions)
          historyEffect(segmentedByNewline)
        },
        horizontalRule = (options?: CompleteOptions) => {
          segmentedByNewline.value.complete(`${segmentedByNewline.value.segment}${segmentedByNewline.value.segment.length > 0 ? '\n' : ''}---\n`, options)
          historyEffect(segmentedByNewline)
        }

  watch(
    () => textbox.completeable.value.string,
    () => segmentedByNewline.value.setString(textbox.completeable.value.string)
  )
    
  watch (
    () => textbox.completeable.value.selection,
    () => segmentedByNewline.value.setSelection(textbox.completeable.value.selection)
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
      element: textbox.root.element,
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
    segmentedBySpace,
    segmentedByNewline,
    ...markdownTextboxEffects,
  }
}
