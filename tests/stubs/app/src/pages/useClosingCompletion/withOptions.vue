<template>
  <section>
    <input type="text" :ref="textbox.root.getRef()" />
  </section>
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'
import { useClosingCompletion } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

const textbox = useTextbox(),
      closingCompletion = useClosingCompletion(textbox, {
        only: ['['],
      })

window.testState =  { textbox, closingCompletion };
</script>
