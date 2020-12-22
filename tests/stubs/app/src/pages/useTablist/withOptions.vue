<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="tablist.root.ref()">
    <div
      v-for="({ id }, index) in tablist.tabs.data"
      :key="id"
      :ref="tablist.tabs.ref(index)"
    >
      {{ metadata.find(({ tab }) => tab === id).tab }}
    </div>
    <div
      v-for="({ id }, index) in tablist.panels.data"
      :key="id"
      :ref="tablist.panels.ref(index)"
    >
      <span>{{ metadata.find(({ tab }) => tab === id).panel }}</span>
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
    const reactiveMetadata = ref(metadata),
          menuStatus = ref('closed'),
          tablist = reactive(useTablist(
            { ids: computed(() => reactiveMetadata.value.map(({ tab }) => tab)), orientation: 'horizontal' },
            {
              selectsPanelOnTabFocus: false,
              openMenu: () => menuStatus.value = 'open',
              deleteTab: index => (reactiveMetadata.value = reactiveMetadata.value.filter((_, i) => i !== index)),
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
      tablist,
      menuStatus
    })
    
    return {
      metadata,
      tablist,
    }
  }
}
</script>
