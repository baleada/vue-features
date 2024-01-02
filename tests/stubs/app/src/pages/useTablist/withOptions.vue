<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="tablist.root.ref()">
    <div
      v-for="({ tab }, index) in tabMetadataRef"
      :key="tab"
      :ref="tablist.tabs.ref(index)"
    >
      {{ tab }}
    </div>
    <div
      v-for="({ tab, panel }, index) in tabMetadataRef"
      :key="tab"
      :ref="tablist.panels.ref(index)"
    >
      <span>{{ panel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { createReorder } from '@baleada/logic'
import { useTablist } from '../../../../../../src/interfaces'
import { tabMetadata, TabMetadatum } from './tabMetadata'

const tabMetadataRef = ref<TabMetadatum[]>(tabMetadata),
      tabIds = computed(() => tabMetadataRef.value.map(({ tab }) => tab)),
      menuStatus = ref('closed'),
      tablist = reactive(useTablist(
        {
          selectsOnFocus: false
        }
      ))  

window.testState =  reactive({
  tabIds,
  tablist,
  menuStatus,
  add: () => tabMetadataRef.value = [...tabMetadataRef.value, { tab: 'Tab #4', panel: 'Content #4' }],
  reorder: () => tabMetadataRef.value = createReorder<TabMetadatum>(1, 2)(tabMetadataRef.value),
})
</script>
