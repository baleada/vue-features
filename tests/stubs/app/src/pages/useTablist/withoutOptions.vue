<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <span :ref="tablist.label.ref()">Tablist</span>
  <div :ref="tablist.root.ref()">
    <div
      v-for="({ tab }, index) in metadata"
      :key="index"
      :ref="tablist.tabs.ref(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ panel }, index) in metadata"
      :key="index"
      :ref="tablist.panels.ref(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useTablist } from '@src/functions/index.js'
import metadata from './metadata.js'

export default {
  props: ['orientation'],
  setup (props) {
    const tablist = reactive(useTablist({ orientation: props.orientation }))

    window.TEST = { tablist }
    
    return {
      metadata,
      tablist,
    }
  }
}
</script>
