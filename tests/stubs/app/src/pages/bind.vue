<template>
  <span ref="stub" />
</template>

<script>
import { ref } from 'vue'
import { bind } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null)

    bind({
      target: stub,
      keys: {
        id: 'stub',
        style_backgroundColor: 'red',
        class: 'stub',
      }
    })

    return { stub }
  }
}
</script>
