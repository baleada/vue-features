<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="`el-${stub}`"
    :ref="stubs.getRef(index)"
  >
    {{ stub }}
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeUpdate, watch, nextTick } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'
import { createReorder, createDelete } from '@baleada/logic'

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2, 3],
            getRef: index => el => els.value[index] = el 
          }),
          add = () => {
            stubs.data = [...stubs.data, stubs.data.length]
          },
          reorder = () => {
            stubs.data = createReorder<number>(1, 2)(stubs.data)
          },
          del = () => {
            stubs.data = createDelete<number>(1)(stubs.data)
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindAttributeOrProperty({
      elementOrElements: els,
      key: 'id',
      value: index => stubs.data[index],
      watchSources: [],
    });

    (window as unknown as WithGlobals).testState =  { add, reorder, del }

    return {
      stubs,
    }
  }
})
</script>
