<template>
  <section>
    <input type="text" :ref="textbox.root.ref" />
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

;(window as unknown as WithGlobals).testState =  { textbox, closingCompletion };
</script>
