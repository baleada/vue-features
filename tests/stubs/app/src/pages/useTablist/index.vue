<template>
  <input type="text" />
  <div :ref="tablist.root.ref">
    <div
      v-for="({ tab, status }, index) in tablist.tabs.values"
      :key="index"
      :ref="tablist.tabs.ref"
      class="tab"
      :class="status === 'selected' ? 'selected' : ''"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ panel }, index) in tablist.panels.values"
      :key="index"
      :ref="tablist.panels.ref"
      class="panel"
    >
      <span>{{ panel }}</span>
      <input type="text" />
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useTablist } from '/@src/features/index.js'

const metadata = [
  { tab: 'Tab #1', panel: 'Content #1' },
  { tab: 'Tab #2', panel: 'Content #2' },
  { tab: 'Tab #3', panel: 'Content #3' },
]

export default {
  setup () {
    return {
      tablist: reactive(useTablist({ metadata, orientation: 'vertical' }, { label: 'my tablist', tabFocusSelectsPanel: false }))
    }
  }
}
</script>
