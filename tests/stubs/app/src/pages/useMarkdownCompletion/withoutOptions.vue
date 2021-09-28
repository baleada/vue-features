<template>
  <section>
    <textarea :ref="textbox.root.ref" />
  </section>
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'
import { useMarkdownCompletion } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

const textbox = useTextbox(),
      markdownCompletion = useMarkdownCompletion(textbox);

(window as unknown as WithGlobals).testState =  { textbox, markdownCompletion }
</script>
