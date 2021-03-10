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
        bold = options => {
          inline.value.complete(`**${inline.value.segment}**`, options)
          completeEffect(inline)
        },
        italic = options => {
          inline.value.complete(`_${inline.value.segment}_`, options)
          completeEffect(inline)
        },
        superscript = options => {
          inline.value.complete(`^${inline.value.segment}^`, options)
          completeEffect(inline)
        },
        subscript = options => {
          inline.value.complete(`~${inline.value.segment}~`, options)
          completeEffect(inline)
        },
        strikethrough = options => {
          inline.value.complete(`~~${inline.value.segment}~~`, options)
          completeEffect(inline)
        },
        code = options => {
          inline.value.complete(`\`${inline.value.segment}\``, options)
          completeEffect(inline)
        },
        link = options => {
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
        codeblock = options => {
          block.value.complete(`\`\`\`\n${block.value.segment}\n\`\`\``, options)
          completeEffect(block)
        },
        blockquote = options => {
          block.value.complete(block.value.segment.split('\n').map(line => `> ${line}`).join('\n'), options)
          completeEffect(block)
        },
        orderedList = options => {
          block.value.complete(block.value.segment.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n'), options)
          completeEffect(block)
        },
        unorderedList = options => {
          block.value.complete(block.value.segment.split('\n').map(line => `- ${line}`).join('\n'), options)
          completeEffect(block)
        },
        heading = (options = {}) => {
          const { level, ...completeableOptions } = options
          const hashes = (new Array(level || 1)).fill().reduce(hashes => hashes + '#', '')
          block.value.complete(`${hashes} ${block.value.segment}`, completeableOptions)
          completeEffect(block)
        },
        horizontalRule = options => {
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
