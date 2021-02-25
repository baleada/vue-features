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
import { bindAttribute } from '@src/affordances'
import { array } from '@baleada/logic'

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
            stubs.data = array(stubs.data).reorder({ from: 1, to: 2 }).normalize()
          },
          del = () => {
            stubs.data = array(stubs.data).delete({ index: 1 }).normalize()
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindAttribute({
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
