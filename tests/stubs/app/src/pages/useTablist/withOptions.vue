<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="tablist.root.ref">
    <div
      v-for="({ tab }, index) in metadataRef"
      :key="tab"
      :ref="tablist.tabs.getRef(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ tab, panel }, index) in metadataRef"
      :key="tab"
      :ref="tablist.panels.getRef(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from 'vue'
import { createReorder, createDelete } from '@baleada/logic'
import { useTablist } from '../../../../../../src/functions'
import metadata from './metadata.js'

export default defineComponent({
  props: ['openMenuKeycombo', 'deleteTabKeycombo'],
  setup (props) {
    const metadataRef = ref(metadata),
          tabIds = computed(() => metadataRef.value.map(({ tab }) => tab)),
          menuStatus = ref('closed'),
          tablist = reactive(useTablist(
            {
              selectsPanelOnTabFocus: false,
              openMenu: ({ index }) => menuStatus.value = 'open',
              deleteTab: ({ index, done }) => {
                metadataRef.value = createDelete({ index })(metadataRef.value)
                done()
              },
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

    (window as unknown as WithGlobals).testState =  reactive({
      tabIds,
      tablist,
      menuStatus,
      add: () => metadataRef.value = [...metadataRef.value, { tab: 'Tab #4', panel: 'Content #4' }],
      reorder: () => metadataRef.value = createReorder({ from: 1, to: 2 })(metadataRef.value),
    })
    
    return {
      metadataRef,
      tablist,
    }
  }
})
</script>
