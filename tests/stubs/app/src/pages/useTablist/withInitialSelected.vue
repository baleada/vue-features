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
import { useTablist } from '../../../../../../src/interfaces'
import { tabMetadata, TabMetadatum } from './tabMetadata'

const tabMetadataRef = ref<TabMetadatum[]>(tabMetadata),
      tabIds = computed(() => tabMetadataRef.value.map(({ tab }) => tab)),
      tablist = reactive(useTablist(
        {
          initialSelected: 1,
        }
      ))  

window.testState =  reactive({
  tabIds,
  tablist,
})
</script>
