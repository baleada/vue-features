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
import { bindList } from '../../../../../../src/affordances/bindList'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: ['red', 'blue', 'green'],
            getRef: index => el => els.value[index] = el 
          }),
          color = ref('red'),
          setColor = c => color.value = c
    
    onBeforeUpdate(() => {
      els.value = []
    })

    bindList({
      element: els,
      list: 'class',
      value: color,
      watchSources: [],
    });

    (window as unknown as WithGlobals).testState =  { setColor }

    return {
      stubs,
    }
  }
})
</script>
