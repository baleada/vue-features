<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="tablist.root()">
    <div
      v-for="({ tab }, index) in metadataRef"
      :key="tab"
      :ref="tablist.tabs(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ tab, panel }, index) in metadataRef"
      :key="tab"
      :ref="tablist.panels(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useReorderable } from '@baleada/vue-composition'
import { useTablist } from '@src/functions/index.js'
import metadata from './metadata.js'

export default {
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
                metadataRef.value = metadataRef.value.filter((_, i) => i !== index)
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
