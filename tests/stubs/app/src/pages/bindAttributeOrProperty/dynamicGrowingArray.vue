<template>
  <span
    v-for="stub in stubs.data"
    :key="stub"
    :ref="stubs.ref"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, nextTick, onBeforeUpdate } from 'vue'
import { bindAttributeOrProperty } from '@src/affordances'

export default {
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
      target: els,
      key: 'id',
      value: count,
    })

    window.TEST = { add, increaseCount }

    return {
      stubs,
    }
  }
}
</script>
