import { watch } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { on } from '../affordances'
import useInput from './useInput.js'

const defaultOptions = {}

export default function useMarkdownInput (options = {}) {
  const { shortcuts } = { ...defaultOptions, ...options }

  // INPUT
  const input = useInput(options),
        completeEffect = c => input.completeable.value.setString(c.value.string).setSelection(c.value.selection)

  // INLINE
  const inline = useCompleteable(input.completeable.value.string, { segment: { from: 'divider', to: 'divider' }, divider: /\s/ }),
        bold = () => {
          inline.value.complete(`**${inline.value.segment}**`)
          completeEffect(inline)
        },
        italic = () => {
          inline.value.complete(`_${inline.value.segment}_`)
          completeEffect(inline)
        },
        superscript = () => {
          inline.value.complete(`^${inline.value.segment}^`)
          completeEffect(inline)
        },
        subscript = () => {
          inline.value.complete(`~${inline.value.segment}~`)
          completeEffect(inline)
        },
        strikethrough = () => {
          inline.value.complete(`~~${inline.value.segment}~~`)
          completeEffect(inline)
        },
        code = () => {
          inline.value.complete(`\`${inline.value.segment}\``)
          completeEffect(inline)
        },
        link = () => {
          inline.value.complete(`[${inline.value.segment}]()`)
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
        codeblock = () => {
          block.value.complete(`\`\`\`\n${block.value.segment}\n\`\`\``)
          completeEffect(block)
        },
        blockquote = () => {
          block.value.complete(block.value.segment.split('\n').map(line => `> ${line}`).join('\n'))
          completeEffect(block)
        },
        orderedList = () => {
          block.value.complete(block.value.segment.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n'))
          completeEffect(block)
        },
        unorderedList = () => {
          block.value.complete(block.value.segment.split('\n').map(line => `- ${line}`).join('\n'))
          completeEffect(block)
        },
        heading = (level = 1) => {
          const hashes = (new Array(level)).fill().reduce(hashes => hashes + '#', '')
          block.value.complete(`${hashes} ${block.value.segment}`)
          completeEffect(block)
        },
        horizontalRule = () => {
          block.value.complete(`${block.value.segment}${block.value.segment.length > 0 ? '\n' : ''}---\n`)
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
  const markdownInput = {
    ...input,
    inline,
    bold,
    italic,
    superscript,
    subscript,
    strikethrough,
    code,
    link,
    block,
    codeblock,
    blockquote,
    orderedList,
    unorderedList,
    heading,
    horizontalRule,
  }

  if (shortcuts) {
    on({
      target: input.element.el,
      events: shortcuts.reduce((events, { event, effect }) => ({
        ...events,
        [event]: e => {
          e.preventDefault()

          if (typeof effect === 'function') {
            effect(markdownInput)
            return
          }

          markdownInput[effect]()
        }
      }), {})
    })
  }

  return markdownInput
}
