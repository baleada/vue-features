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
import { defineComponent, ref, reactive, onBeforeUpdate } from 'vue'
import { bindList } from '../../../../../../src/extracted/bindList'

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: ['red', 'blue', 'green'],
            getRef: index => el => els.value[index] = el 
          })
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindList({
      element: els,
      list: 'class',
      value: ({ element, index }) => stubs.data[index],
      watchSources: [],
    })

    return {
      stubs,
    }
  }
})
</script>
