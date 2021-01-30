<template>
  <span ref="stub">useConditionalDisplay</span>
</template>

<script>
import { ref } from 'vue'
import { useConditionalDisplay } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          }

    useConditionalDisplay({
      target: stub,
      condition: isShown,
    })

    window.TEST = { toggle }

    return { stub, isShown }
  }
}
</script>
