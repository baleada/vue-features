<template>
  <section>
    <textarea :ref="textbox.root.ref()" style="height: 200px; width: 400px" />
  </section>
</template>

<script setup lang="ts">
import { on } from '../../../../../../src/affordances'
import { useTextbox } from '../../../../../../src/interfaces'
import { useMarkdownCompletion } from '../../../../../../src/extensions'

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
})

window.testState =  { textbox, markdownCompletion }
</script>
