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
import { createReorder } from '@baleada/logic'

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            ref: index => el => els.value[index] = el 
          }),
          add = () => (stubs.data = [...stubs.data, stubs.data.length]),
          reorder = () => {
            stubs.data = createReorder({ from: 1, to: 2 })(stubs.data)
            updates.value++
          },
          updates = ref(0)
    
    onBeforeUpdate(() => {
      els.value = []
    })

    const ids = useId({
      element: els,
      watchSources: [updates],
    })

    onMounted(() => (window as unknown as WithGlobals).testState =  { ids, add, reorder })

    return {
      stubs,
    }
  }
})
</script>
