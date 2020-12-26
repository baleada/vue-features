<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="tablist.root.ref()">
    <div
      v-for="({ status }, index) in tablist.tabs.data"
      :key="metadataRef[index].tab"
      :ref="tablist.tabs.ref(index)"
    >
      {{ metadataRef[index].tab }}
    </div>
    <div
      v-for="({ status }, index) in tablist.panels.data"
      :key="metadataRef[index].tab"
      :ref="tablist.panels.ref(index)"
    >
      <span>{{ metadataRef[index].panel }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useTablist } from '/@src/features/index.js'
import metadata from './metadata.js'

export default {
  props: ['openMenuKeycombo', 'deleteTabKeycombo'],
  setup (props) {
    const metadataRef = ref(metadata),
          tabIds = computed(() => metadataRef.value.map(({ tab }) => tab)),
          menuStatus = ref('closed'),
          tablist = reactive(useTablist(
            { totalTabs: computed(() => metadataRef.value.length), orientation: 'horizontal' },
            {
              selectsPanelOnTabFocus: false,
              openMenu: () => menuStatus.value = 'open',
              deleteTab: index => (metadataRef.value = metadataRef.value.filter((_, i) => i !== index)),
              label: 'Tablist',
              ...(() => {
                return props.openMenuKeycombo
                  ? {
                      openMenuKeycombo: props.openMenuKeycombo,
                      deleteTabKeycombo: props.deleteTabKeycombo,
                    }
                  : {}
              })(),
            }
          ))    

    window.TEST = reactive({
      tabIds,
      tablist,
      menuStatus
    })
    
    return {
      metadataRef,
      tablist,
    }
  }
}
</script>
