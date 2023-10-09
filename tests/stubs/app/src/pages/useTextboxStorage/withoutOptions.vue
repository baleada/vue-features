<template>
  <input :ref="textbox.root.getRef()" type="text" />
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'
import { useTextboxStorage } from '../../../../../../src/extensions'

const textbox = useTextbox(),
      storage = useTextboxStorage(textbox);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState =  { textbox, storage, cleanup }
</script>
