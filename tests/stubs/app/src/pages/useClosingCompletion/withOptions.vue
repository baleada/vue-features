<template>
  <section>
    <input type="text" :ref="textbox.root.ref()" />
  </section>
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'
import { useClosingCompletion } from '../../../../../../src/extensions'

const textbox = useTextbox(),
      closingCompletion = useClosingCompletion(textbox, {
        only: ['['],
      })

window.testState =  { textbox, closingCompletion };
</script>
