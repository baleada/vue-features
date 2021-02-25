<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.ref(index)"
    class="stub"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, onBeforeUpdate, watch, nextTick } from 'vue'
import { bindList } from '@src/affordances'

export default {
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: ['red', 'blue', 'green'],
            ref: index => el => els.value[index] = el 
          })
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindList({
      target: els,
      list: 'class',
      value: ({ target, index }) => stubs.data[index]
    })

    return {
      stubs,
    }
  }
}
</script>
