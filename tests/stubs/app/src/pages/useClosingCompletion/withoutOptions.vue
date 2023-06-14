<template>
  <section>
    <input type="text" :ref="textbox.root.getRef()" />
  </section>
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'
import { useClosingCompletion } from '../../../../../../src/extensions'

const textbox = useTextbox(),
      closingCompletion = useClosingCompletion(textbox)

window.testState =  { textbox, closingCompletion }
</script>
