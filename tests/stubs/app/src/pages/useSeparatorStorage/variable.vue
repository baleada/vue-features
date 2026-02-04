<template>
  <div>
    <div :ref="el1.ref()">pane 1</div>
    <div :ref="separator.root.ref({ controls: el1.id.value })"></div>
    <div>pane 2</div>
  </div>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted'
import { useSeparator } from '../../../../../../src/interfaces'
import { useSeparatorStorage } from '../../../../../../src/extensions'

const el1 = useElementApi({ identifies: true })
const separator = useSeparator({ kind: 'variable' }),
      storage = useSeparatorStorage(separator);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState = { separator, storage, cleanup }
</script>
