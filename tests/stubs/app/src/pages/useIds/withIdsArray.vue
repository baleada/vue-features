<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.ref(index)"
    :id="`${stub}`"
  >
    {{ stub }}
  </span>
</template>

<script>
import { ref, reactive, onBeforeUpdate, onMounted } from 'vue'
import { useIds } from '/@src/util'

export default {
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            ref: index => el => els.value[index] = el 
          })
    
    onBeforeUpdate(() => {
      els.value = []
    })

    const ids = useIds({
      target: els,
    })

    onMounted(() => window.TEST = { ids })
    

    return {
      stubs,
    }
  }
}
</script>
