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
import { defineComponent, ref, reactive, onBeforeUpdate, onMounted } from 'vue'
import { useId } from '../../../../../../src/util'

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            ref: index => el => els.value[index] = el 
          })
    
    onBeforeUpdate(() => {
      els.value = []
    })

    const ids = useId({
      element: els,
    })

    onMounted(() => (window as unknown as WithGlobals).testState =  { ids })

    return {
      stubs,
    }
  }
})
</script>
