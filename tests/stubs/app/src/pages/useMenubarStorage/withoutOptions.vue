<template>
  <div :ref="menubar.root.ref()">
    <div
      v-for="(option, index) in optionMetadata"
      :key="option"
      :ref="menubar.items.ref(index)"
    >
      <span>{{ option }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMenubar } from '../../../../../../src/interfaces'
import { useMenubarStorage } from '../../../../../../src/extensions'
import { optionMetadata } from '../useListbox/optionMetadata'

const menubar = useMenubar(),
      storage = useMenubarStorage(menubar);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState = { menubar, storage, cleanup }
</script>
