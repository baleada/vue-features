<template>
  <div :ref="tablist.root.getRef()">
    <div
      v-for="({ name }, index) in organizations"
      :key="index"
      :ref="tablist.tabs.getRef(index)"
    >
      {{ name }}
    </div>
    <div
      v-for="({ name, why }, index) in organizations"
      :key="name"
      :ref="tablist.panels.getRef(index)"
    >
      <p v-for="p in why">{{ p }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFetchable } from '@baleada/vue-composition'
import type { Organization } from '@alexvipond/mulago-foundation-portfolio'
import { useTablist } from '../../../../../../src/interfaces'
import { useTablistStorage } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'
import { tabMetadata } from '../useTablist/tabMetadata'

const mulagoFoundationPortfolio = useFetchable('https://raw.githubusercontent.com/AlexVipond/mulago-foundation-portfolio/main/src/portfolio.json')
const organizations = ref<Organization[]>([])

const totalTabs = 3

onMounted(async () => {
  await mulagoFoundationPortfolio.value.get()
  const json = await mulagoFoundationPortfolio.value.json

  organizations.value = new Array(totalTabs).fill(0).map(() => json.value[Math.floor(Math.random() * json.value.length)])
  tablist.focus.exact(0)
})

const tablist = useTablist(),
      storage = useTablistStorage(tablist);

const cleanup = () => {
  storage.storeable.value.remove()
  storage.storeable.value.removeStatus()
}

;(window as unknown as WithGlobals).testState =  { tablist, storage, cleanup }
</script>
