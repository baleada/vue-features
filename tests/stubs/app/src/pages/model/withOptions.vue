<template>
  <input type="text" ref="stub" />
</template>

<script>
import { ref } from 'vue'
import { model } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null),
          value = ref('')

    model(
      { target: stub, value },
      {
        key: 'dataValue',
        event: 'change',
      }
    )

    window.TEST = { value }

    return { stub }
  }
}
</script>
