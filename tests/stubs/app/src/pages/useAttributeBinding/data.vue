<template>
  <span ref="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { useAttributeBinding } from '/@src/affordances'

export default {
  setup () {
    const stub = ref(null)

    useAttributeBinding({
      target: stub,
      attribute: 'dataLabel',
      value: 'stub'
    })

    return { stub }
  }
}
</script>
