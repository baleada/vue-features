<template>
  <input :ref="textbox.root.getRef()" type="text" />
</template>

<script setup lang="ts">
import { useTextbox } from '../../../../../../src/interfaces'
import { useTextboxStorage } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

const textbox = useTextbox(),
      storage = useTextboxStorage(textbox);

const cleanup = () => {
  storage.storeable.value.remove()
  storage.storeable.value.removeStatus()
}

;(window as unknown as WithGlobals).testState =  { textbox, storage, cleanup }
</script>
