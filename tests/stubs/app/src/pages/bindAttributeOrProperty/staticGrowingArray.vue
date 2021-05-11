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
import { ref, reactive, onBeforeUpdate } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/affordances'

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

    bindAttributeOrProperty({
      target: els,
      key: 'id',
      value: 'stub'
    })

    window.TEST = { add }

    return {
      stubs,
    }
  }
}
</script>
