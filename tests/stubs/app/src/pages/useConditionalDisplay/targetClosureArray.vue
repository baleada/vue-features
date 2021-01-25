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
import { ref, reactive, onBeforeUpdate } from 'vue'
import { useConditionalDisplay } from '/@src/affordances'

export default {
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            ref: index => el => els.value[index] = el 
          }),
          conditions = ref([
            true,
            true,
            true,
          ]),
          toggle = index => { conditions.value[index] = !conditions.value[index]; updates.value++ },
          updates = ref(0)
    
    onBeforeUpdate(() => {
      els.value = []
    })

    useConditionalDisplay({
      target: els,
      condition: {
        targetClosure: ({ index }) => conditions.value[index],
        watchSources: updates,
      },
    })

    window.TEST = { toggle }

    return {
      stubs,
    }
  }
}
</script>
