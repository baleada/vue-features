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
import { ref, reactive, onBeforeUpdate, onMounted } from 'vue'
import { useId } from '../../../../../../src/util'

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

    const ids = useId({
      target: els,
    })

    onMounted(() => window.TEST = { ids })

    return {
      stubs,
    }
  }
}
</script>
