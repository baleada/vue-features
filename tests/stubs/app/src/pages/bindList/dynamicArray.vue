<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.getRef(index)"
    class="stub"
  >
    {{ stub }}
  </span>
</template>

<script lang="ts">
import { ref, reactive, onBeforeUpdate, watch, nextTick } from 'vue'
import { bindList } from '../../../../../../src/affordances'

export default {
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: ['red', 'blue', 'green'],
            ref: index => el => els.value[index] = el 
          }),
          color = ref('red'),
          setColor = c => color.value = c
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindList({
      target: els,
      list: 'class',
      value: color
    })

    window.TEST = { setColor }

    return {
      stubs,
    }
  }
}
</script>
