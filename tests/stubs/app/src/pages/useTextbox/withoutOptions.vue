<template>
  <section>
    <input type="text" :ref="textbox.root.ref" />
  </section>
  <section>
    <button @click="() => textbox.undo()">undo</button>
    <button @click="() => textbox.redo()">redo</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useTextbox } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types'

const textbox = reactive(useTextbox());

(window as unknown as WithGlobals).testState =  { textbox }
</script>
