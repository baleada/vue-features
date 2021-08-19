<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <span :ref="tablist.label.ref">Tablist</span>
  <div :ref="tablist.root.ref">
    <div
      v-for="({ tab }, index) in metadata"
      :key="index"
      :ref="tablist.tabs.getRef(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ panel }, index) in metadata"
      :key="index"
      :ref="tablist.panels.getRef(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue'
import { useTablist } from '../../../../../../src/functions'
import metadata from './metadata.js'

export default defineComponent({
  props: ['orientation'],
  setup (props) {
    const tablist = reactive(useTablist({ orientation: props.orientation }))

    (window as unknown as WithGlobals).testState =  { tablist }
    
    return {
      metadata,
      tablist,
    }
  }
})
</script>
