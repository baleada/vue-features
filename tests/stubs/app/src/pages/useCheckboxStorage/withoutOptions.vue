<template>
  <input type="checkbox" :ref="checkbox.root.ref()" />
</template>

<script setup lang="ts">
import { useCheckbox } from '../../../../../../src/interfaces'
import { useCheckboxStorage } from '../../../../../../src/extensions'

const checkbox = useCheckbox(),
      storage = useCheckboxStorage(checkbox);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState = { checkbox, storage, cleanup }
</script>
