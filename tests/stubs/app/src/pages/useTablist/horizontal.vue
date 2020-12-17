<template>
  <div id="test">
    <span :ref="tablist.label.ref">Tablist</span>
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
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useTablist } from '/@src/features/index.js'
import metadata from './metadata.js'

export default {
  setup () {
    return {
      tablist: reactive(useTablist(
        { metadata, orientation: 'horizontal' }
      ))
    }
  }
}
</script>
