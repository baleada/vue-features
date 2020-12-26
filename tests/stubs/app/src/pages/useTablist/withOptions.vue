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
import { useReorderable } from '@baleada/vue-composition'
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
      menuStatus,
      add: () => metadataRef.value = [...metadataRef.value, { tab: 'Tab #4', panel: 'Content #4' }],
      reorder: () => metadataRef.value = useReorderable(metadataRef.value).value.reorder({ from: 1, to: 2 }),
    })
    
    return {
      metadataRef,
      tablist,
    }
  }
}
</script>
