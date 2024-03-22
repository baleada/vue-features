<template>
  <button id="previous">previous</button>
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
      <button>focusable</button>
    </div>
  </div>
  <button id="next">next</button>
</template>

<script setup lang="ts">
import { useTablist } from '../../../../../../src/interfaces'
import { tabMetadata } from './tabMetadata'

const tablist = useTablist()

window.testState =  { tablist }
</script>
