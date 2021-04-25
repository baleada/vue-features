<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.getRef(index)"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, onBeforeUpdate, watch, nextTick } from 'vue'
import { bindStyle } from '../../../../../../src/affordances'

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

    bindStyle({
      target: els,
      property: 'backgroundColor',
      value: ({ target, index }) => stubs.data[index]
    })

    return {
      stubs,
    }
  }
}
</script>
