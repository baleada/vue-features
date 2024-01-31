<template>
  <section>
    <input type="text" :ref="textbox.root.ref()" />
  </section>
  <section>
    <button @click="() => textbox.undo()">undo</button>
    <button @click="() => textbox.redo()">redo</button>
  </section>
  <section>
    <input type="text" />
  </section>
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'

const textbox = useTextbox()

window.testState =  { textbox }
</script>
