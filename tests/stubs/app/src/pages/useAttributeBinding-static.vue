<template>
  <span ref="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { useAttributeBinding } from '/@src/util'

export default {
  setup () {
    const stub = ref(null)

    useAttributeBinding({
      target: stub,
      attribute: 'id',
      value: 'stub'
    })

    return { stub }
  }
}
</script>
