<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.getRef(index)"
  >
    {{ stub }}
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeUpdate } from 'vue'
import { bindStyle } from '../../../../../../src/affordances/bindStyle'

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

    bindStyle({
      element: els,
      property: 'backgroundColor',
      value: ({ element, index }) => stubs.data[index],
      watchSources: [],
    })

    return {
      stubs,
    }
  }
})
</script>
