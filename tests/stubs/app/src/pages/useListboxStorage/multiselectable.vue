<template>
  <div :ref="listbox.root.ref()">
    <div
      v-for="(option, index) in optionMetadata"
      :key="index"
      :ref="listbox.options.ref(index)"
    >
      <span>{{ option }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListbox } from '../../../../../../src/interfaces'
import { useListboxStorage } from '../../../../../../src/extensions'
import { optionMetadata } from '../useListbox/optionMetadata'

const listbox = useListbox({ multiselectable: true }),
      storage = useListboxStorage(listbox);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState = { listbox, storage, cleanup }
</script>
