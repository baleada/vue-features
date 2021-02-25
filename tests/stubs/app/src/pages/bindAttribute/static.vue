<template>
  <span ref="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { bindAttribute } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null)

    bindAttribute({
      target: stub,
      attribute: 'id',
      value: 'stub'
    })

    return { stub }
  }
}
</script>
