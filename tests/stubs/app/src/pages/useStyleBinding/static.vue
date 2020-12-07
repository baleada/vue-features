<template>
  <span ref="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { useStyleBinding } from '/@src/affordances'

export default {
  setup () {
    const stub = ref(null)

    useStyleBinding({
      target: stub,
      property: 'backgroundColor',
      value: 'red'
    })

    return { stub }
  }
}
</script>
