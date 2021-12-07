<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.getRef(index)"
  >
    {{ stub }}
  </span>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUpdate, onMounted } from 'vue'
import { identify } from '../../../../../../src/affordances'
import { createReorder } from '@baleada/logic'
import { WithGlobals } from '../../../../../fixtures/types'

const els = ref([]),
      stubs = reactive({
        data: [0, 1, 2],
        getRef: index => el => els.value[index] = el 
      }),
      add = () => (stubs.data = [...stubs.data, stubs.data.length]),
      reorder = () => {
        stubs.data = createReorder<number>({ from: 1, to: 2 })(stubs.data)
        updates.value++
      },
      updates = ref(0)

onBeforeUpdate(() => {
  els.value = []
})

const ids = identify({ element: els }, {
  watchSource: updates,
})

onMounted(() => (window as unknown as WithGlobals).testState =  { ids, add, reorder })
</script>
