<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="`el-${stub}`"
    :ref="stubs.ref(index)"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, onBeforeUpdate, watch, nextTick } from 'vue'
import { useAttributeBinding } from '/@src/affordances'
import { useReorderable, useDeleteable } from '@baleada/vue-composition'

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
            stubs.data = [...useReorderable(stubs.data).value.reorder({ from: 1, to: 2 })]
          },
          del = () => {
            stubs.data = [...useDeleteable(stubs.data).value.delete({ index: 1 })]
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    useAttributeBinding({
      target: els,
      attribute: 'id',
      value: ({ target, index }) => stubs.data[index]
    })

    window.TEST = { add, reorder, del }

    return {
      stubs,
    }
  }
}
</script>
