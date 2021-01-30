<template>
  <span ref="stub" />
</template>

<script>
import { ref } from 'vue'
import { useBindings } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null)

    useBindings({
      target: stub,
      bindings: {
        id: 'stub',
        style_backgroundColor: 'red',
        class: 'stub',
      }
    })

    return { stub }
  }
}
</script>
