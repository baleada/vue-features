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
import { useAttributeBinding } from '/@src/affordances'

export default {
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

    useAttributeBinding({
      target: els,
      attribute: 'id',
      value: (el, index) => stubs.data[index]
    })

    window.TEST = { add }

    return {
      stubs,
    }
  }
}
</script>
