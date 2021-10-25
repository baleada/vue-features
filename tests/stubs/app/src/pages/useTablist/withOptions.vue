<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="tablist.root.ref">
    <div
      v-for="({ tab }, index) in tabMetadataRef"
      :key="tab"
      :ref="tablist.tabs.getRef(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ tab, panel }, index) in tabMetadataRef"
      :key="tab"
      :ref="tablist.panels.getRef(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { createReorder, createDelete } from '@baleada/logic'
import { useTablist, UseTablistOptions } from '../../../../../../src/interfaces'
import { tabMetadata, TabMetadatum } from './tabMetadata'
import { WithGlobals } from '../../../../../fixtures/types'

const props = defineProps({
  openMenuKeycombo: String,
  deleteTabKeycombo: String,
})

const tabMetadataRef = ref<TabMetadatum[]>(tabMetadata),
      tabIds = computed(() => tabMetadataRef.value.map(({ tab }) => tab)),
      menuStatus = ref('closed'),
      tablist = reactive(useTablist(
        {
          selectsTabOnFocus: false,
          openMenu: ({ index }) => menuStatus.value = 'open',
          deleteTab: ({ index, done }) => {
            tabMetadataRef.value = createDelete<TabMetadatum>({ index })(tabMetadataRef.value)
            done()
          },
          ...(() => {
            return props.openMenuKeycombo
              ? {
                  openMenuKeycombo: props.openMenuKeycombo as UseTablistOptions['openMenuKeycombo'],
                  deleteTabKeycombo: props.deleteTabKeycombo as UseTablistOptions['deleteTabKeycombo'],
                }
              : {}
          })(),
        }
      ));  

(window as unknown as WithGlobals).testState =  reactive({
  tabIds,
  tablist,
  menuStatus,
  add: () => tabMetadataRef.value = [...tabMetadataRef.value, { tab: 'Tab #4', panel: 'Content #4' }],
  reorder: () => tabMetadataRef.value = createReorder<TabMetadatum>({ from: 1, to: 2 })(tabMetadataRef.value),
})
</script>
