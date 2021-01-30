<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <span :ref="tablist.label()">Tablist</span>
  <div :ref="tablist.root()">
    <div
      v-for="({ tab }, index) in metadata"
      :key="index"
      :ref="tablist.tabs(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ panel }, index) in metadata"
      :key="index"
      :ref="tablist.panels(index)"
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
    const tablist = reactive(useTablist(
      { totalTabs: metadata.length, orientation: props.orientation }
    ))

    window.TEST = reactive({
      tablist
    })
    
    return {
      metadata,
      tablist,
    }
  }
}
</script>
