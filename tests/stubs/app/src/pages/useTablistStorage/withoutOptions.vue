<template>
  <div :ref="tablist.root.ref()">
    <div
      v-for="({ tab }, index) in tabMetadata"
      :key="index"
      :ref="tablist.tabs.ref(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ panel }, index) in tabMetadata"
      :key="index"
      :ref="tablist.panels.ref(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTablist } from '../../../../../../src/interfaces'
import { useTablistStorage } from '../../../../../../src/extensions'
import { tabMetadata } from '../useTablist/tabMetadata'

const tablist = useTablist(),
      storage = useTablistStorage(tablist);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState =  { tablist, storage, cleanup }
</script>
