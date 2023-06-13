<template>
  <section>
    <input type="text" :ref="textbox.root.getRef()" />
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

const textbox = reactive(useTextbox())

window.testState =  { textbox }
</script>
