<template>
  <div :ref="tablist.root.getRef()">
    <div
      v-for="({ tab }, index) in tabMetadata"
      :key="index"
      :ref="tablist.tabs.getRef(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ panel }, index) in tabMetadata"
      :key="index"
      :ref="tablist.panels.getRef(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTablist } from '../../../../../../src/interfaces'
import { useTablistStorage } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'
import { tabMetadata } from '../useTablist/tabMetadata'

const tablist = useTablist(),
      storage = useTablistStorage(tablist);

const cleanup = () => {
  storage.storeable.value.remove()
  storage.storeable.value.removeStatus()
}

;(window as unknown as WithGlobals).testState =  { tablist, storage, cleanup }
</script>
