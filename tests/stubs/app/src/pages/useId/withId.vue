<template>
  <span ref="stub" id="stub" />
  <code>{{ id }}</code>
</template>

<script>
import { ref } from 'vue'
import { useId } from '/@src/util'

export default {
  setup () {
    const stub = ref(null),
          id = useId(stub)

    return {
      stub,
      id
    }
  }
}
</script>
