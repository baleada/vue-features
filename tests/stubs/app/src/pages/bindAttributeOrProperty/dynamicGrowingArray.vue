<template>
  <span
    v-for="stub in stubs.data"
    :key="stub"
    :ref="stubs.ref"
  >
    {{ stub }}
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeUpdate } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2, 3],
            ref: el => els.value.push(el)
          }),
          count = ref(0),
          add = () => {
            stubs.data = [...stubs.data, stubs.data.length]
          },
          increaseCount = () => count.value++
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindAttributeOrProperty({
      elementOrElements: els,
      key: 'id',
      value: count,
      watchSources: [],
    })

    ;(window as unknown as WithGlobals).testState =  { add, increaseCount }

    return {
      stubs,
    }
  }
})
</script>
