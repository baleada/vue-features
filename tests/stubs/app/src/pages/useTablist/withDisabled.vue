<template>
  <div style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem;">
    <!-- Input is just a focus target for testing tab navigation -->
    <input type="text" />
    <div
      :ref="tablist.root.ref"
      class="flex flex-col gap-4"
    >
      <div class="flex gap-2">
        <div
          v-for="({ tab }, index) in tabMetadataRef"
          :key="tab"
          :ref="tablist.tabs.getRef(index)"
          class="px-2 py-1 rounded-sm"
          :class="{
            'bg-green-600 text-green-50': enabled[index] === 'enabled',
            'bg-red-600 text-red-50': enabled[index] === 'disabled',
          }"
        >
          {{ tab }}
        </div>
      </div>
      <div
        v-for="({ tab, panel }, index) in tabMetadataRef"
        :key="tab"
        :ref="tablist.panels.getRef(index)"
        class="px-2 py-6 border-2 border-gray-700 rounded-sm"
      >
        <span>{{ panel }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="(item, index) in enabled"
          :key="index"
          class="flex gap-2"
        >
          <button
            class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
            @click="() => enable(index)">Enable {{ tabMetadataRef[index].tab }}
          </button>
          <button
            class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
            @click="() => disable(index)">Disable {{ tabMetadataRef[index].tab }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { createReorder, createDelete, createReplace } from '@baleada/logic'
import { useTablist } from '../../../../../../src/interfaces'
import { tabMetadata, TabMetadatum } from './tabMetadata'
import { WithGlobals } from '../../../../../fixtures/types'

const tabMetadataRef = ref<TabMetadatum[]>(tabMetadata),
      tabIds = computed(() => tabMetadataRef.value.map(({ tab }) => tab)),
      menuStatus = ref('closed'),
      enabled = ref(new Array(3).fill('enabled')),
      enable = (index: number) => enabled.value = createReplace({ index, item: 'enabled' })(enabled.value),
      disable = (index: number) => enabled.value = createReplace({ index, item: 'disabled' })(enabled.value),
      tablist = reactive(useTablist(
        {
          deleteTab: ({ index, done }) => {
            tabMetadataRef.value = createDelete<TabMetadatum>({ index })(tabMetadataRef.value)
            done()
          },
          deleteTabKeycombo: 'delete' as '+delete',
          getTabAbility: {
            getValue: ({ index }) => enabled.value[index],
            watchSources: enabled,
          },
          disabledTabsReceiveFocus: false,
          loops: true,
        }
      ));  

(window as unknown as WithGlobals).testState =  reactive({
  tabIds,
  tablist,
  menuStatus,
  add: () => tabMetadataRef.value = [...tabMetadataRef.value, { tab: 'Tab #4', panel: 'Content #4' }],
  reorder: () => tabMetadataRef.value = createReorder<TabMetadatum>({ from: 1, to: 2 })(tabMetadataRef.value),
  enabled,
  enable,
  disable,
})
</script>
