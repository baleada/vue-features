<template>
  <section>
    <textarea :ref="textbox.root.ref" />
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
      markdownCompletion.bold()
    },
    'shift+cmd+.': event => {
      event.preventDefault()
      markdownCompletion.blockquote()
    },
  }
});

(window as unknown as WithGlobals).testState =  { textbox, markdownCompletion }
</script>
