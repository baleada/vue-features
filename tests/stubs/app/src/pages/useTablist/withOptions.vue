<template>
  <!-- Input is just a focus target for testing tab navigation -->
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
import metadata from './metadata.js'

export default {
  props: ['orientation'],
  setup (props) {
    const reactiveMetadata = ref(metadata),
          tablist = reactive(useTablist(
            { metadata: reactiveMetadata, orientation: props.orientation },
            { 
              selectsPanelOnTabFocus: false, 
              openMenu: () => (menuStatus.value = open),
              deleteTab: location => (reactiveMetadata.value = reactiveMetadata.value.filter((item, index) => index !== location)),
              label: 'Tablist',
            }
          ))

    window.TEST = {
      tablist,
      menuStatus,
    }
    
    return {
      tablist
    }
  }
}
</script>
