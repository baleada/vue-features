<template>
  <div :ref="tablist.root.ref()">
    <div
      v-for="({ name }, index) in organizations"
      :key="index"
      :ref="tablist.tabs.ref(index)"
    >
      {{ name }}
    </div>
    <div
      v-for="({ name, why }, index) in organizations"
      :key="name"
      :ref="tablist.panels.ref(index)"
    >
      <p v-for="p in why">{{ p }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFetchable } from '@baleada/vue-composition'
import { Organization } from '@alexvipond/mulago'
import { useTablist } from '../../../../../../src/interfaces'
import { useTablistStorage } from '../../../../../../src/extensions'

const mulagoFoundationPortfolio = useFetchable('https://raw.githubusercontent.com/AlexVipond/mulago/main/src/portfolio.json')
const organizations = ref<Organization[]>([])

const totalTabs = 3

onMounted(async () => {
  await mulagoFoundationPortfolio.get()
  const json = await mulagoFoundationPortfolio.json.resolve()

  organizations.value = new Array(totalTabs).fill(0).map(() => json.value[Math.floor(Math.random() * json.value.length)])
})

const tablist = useTablist(),
      storage = useTablistStorage(tablist);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState =  { tablist, storage, cleanup }
</script>
