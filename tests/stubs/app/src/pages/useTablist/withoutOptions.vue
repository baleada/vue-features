<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
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
import { useTablist, UseTablistOptions } from '../../../../../../src/interfaces'
import { tabMetadata } from './tabMetadata'

const props = defineProps({ orientation: String })

const tablist = useTablist({ orientation: props.orientation as UseTablistOptions['orientation'] })

window.testState =  { tablist }
</script>
