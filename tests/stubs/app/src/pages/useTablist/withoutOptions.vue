<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
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
import { reactive } from 'vue'
import { useTablist, UseTablistOptions } from '../../../../../../src/interfaces'
import { tabMetadata } from './tabMetadata'

const props = defineProps({ orientation: String })

const tablist = reactive(useTablist({ orientation: props.orientation as UseTablistOptions['orientation'] }))

window.testState =  { tablist }
</script>
