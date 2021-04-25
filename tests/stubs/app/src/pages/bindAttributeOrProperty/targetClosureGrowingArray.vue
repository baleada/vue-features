<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="`el-${stub}`"
    :ref="stubs.getRef(index)"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, onBeforeUpdate, watch, nextTick } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/affordances'
import { createReorder, createDelete } from '@baleada/logic'

export default {
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2, 3],
            ref: index => el => els.value[index] = el 
          }),
          add = () => {
            stubs.data = [...stubs.data, stubs.data.length]
          },
          reorder = () => {
            stubs.data = createReorder({ from: 1, to: 2 })(stubs.data)
          },
          del = () => {
            stubs.data = createDelete({ index: 1 })(stubs.data)
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindAttributeOrProperty({
      target: els,
      key: 'id',
      value: ({ target, index }) => stubs.data[index]
    })

    window.TEST = { add, reorder, del }

    return {
      stubs,
    }
  }
}
</script>
