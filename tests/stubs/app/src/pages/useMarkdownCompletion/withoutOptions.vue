<template>
  <section>
    <textarea :ref="textbox.root.ref" style="height: 200px; width: 400px" />
  </section>
</template>

<script setup lang="ts">
import { on } from '../../../../../../src/affordances'
import { useTextbox } from '../../../../../../src/interfaces'
import { useMarkdownCompletion } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

const textbox = useTextbox(),
      markdownCompletion = useMarkdownCompletion(textbox)

on<any>({
  element: textbox.root.element,
  effects: {
    'cmd+b': event => {
      event.preventDefault()
      if (/\s/.test(markdownCompletion.inline.completeable.value.segment)) {
        markdownCompletion.selected.bold()
      } else {
        markdownCompletion.inline.bold()
      }
    },
    'shift+cmd+.': event => {
      event.preventDefault()
      markdownCompletion.block.blockquote()
    },
  }
});

(window as unknown as WithGlobals).testState =  { textbox, markdownCompletion }
</script>
