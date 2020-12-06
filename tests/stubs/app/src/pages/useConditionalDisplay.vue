<template>
  <span ref="stub" />
  <button @click="() => (isShown = !isShown)" />
</template>

<script>
import { ref } from 'vue'
import { useConditionalDisplay } from '/@src/util'

export default {
  setup () {
    const stub = ref(null),
          isShown = ref(true)

    useConditionalDisplay({
      target: stub,
      condition: isShown,
    })

    return { stub, isShown }
  }
}
</script>
