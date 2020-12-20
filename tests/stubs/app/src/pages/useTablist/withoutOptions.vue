<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <span :ref="tablist.label.ref">Tablist</span>
  <div :ref="tablist.root.ref">
    <div
      v-for="(tab, index) in tablist.tabs.data"
      :key="index"
      :ref="tablist.tabs.ref"
      :class="tab.status === 'selected' ? 'selected' : ''"
    >
      {{ metadata[index].tab }}
    </div>
    <div
      v-for="(panel, index) in tablist.panels.data"
      :key="index"
      :ref="tablist.panels.ref"
      :class="panel.status === 'selected' ? 'selected' : ''"
    >
      <span>{{ metadata[index].panel }}</span>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useTablist } from '/@src/features/index.js'
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
