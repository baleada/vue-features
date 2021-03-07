<template>
  <input type="text" ref="stub" />
</template>

<script>
import { ref } from 'vue'
import { naiveModel } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null),
          value = ref('')

    naiveModel(
      { target: stub, value },
      {
        key: 'placeholder',
        event: 'change',
      }
    )

    window.TEST = { value }

    return { stub }
  }
}
</script>
