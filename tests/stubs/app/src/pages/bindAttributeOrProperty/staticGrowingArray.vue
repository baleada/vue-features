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
          add = () => {
            stubs.data = [...stubs.data, stubs.data.length]
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindAttributeOrProperty({
      elementOrElements: els,
      key: 'id',
      value: 'stub',
      watchSources: [],
    })

    ;(window as unknown as WithGlobals).testState =  { add }

    return {
      stubs,
    }
  }
})
</script>
