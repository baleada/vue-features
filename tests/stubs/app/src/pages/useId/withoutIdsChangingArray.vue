<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.ref(index)"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, onBeforeUpdate, onMounted } from 'vue'
import { useId } from '@src/util'
import { useReorderable } from '@baleada/vue-composition'

export default {
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            ref: index => el => els.value[index] = el 
          }),
          add = () => (stubs.data = [...stubs.data, stubs.data.length]),
          reorder = () => {
            stubs.data = useReorderable(stubs.data).value.reorder({ from: 1, to: 2 })
            updates.value++
          },
          updates = ref(0)
    
    onBeforeUpdate(() => {
      els.value = []
    })

    const ids = useId({
      target: els,
      watchSources: [updates],
    })

    onMounted(() => window.TEST = { ids, add, reorder })

    return {
      stubs,
    }
  }
}
</script>
