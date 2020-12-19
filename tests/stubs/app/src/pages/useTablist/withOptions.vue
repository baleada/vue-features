<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
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
import { ref, computed, reactive } from 'vue'
import { useTablist } from '/@src/features/index.js'
import metadata from './metadata.js'

export default {
  props: ['orientation'],
  setup (props) {
    const reactiveMetadata = ref(metadata),
          menuStatus = ref('closed'),
          tablist = reactive(useTablist(
            { totalTabs: computed(() => reactiveMetadata.value.length), orientation: props.orientation },
            {
              selectsPanelOnTabFocus: false,
              openMenu: () => menuStatus.value = 'open',
              deleteTab: index => (reactiveMetadata.value = reactiveMetadata.value.filter((_, i) => i !== index)),
              label: 'Tablist',
            }
          ))

    window.TEST = {
      tablist,
      menuStatus
    }
    
    return {
      metadata,
      tablist,
    }
  }
}
</script>
