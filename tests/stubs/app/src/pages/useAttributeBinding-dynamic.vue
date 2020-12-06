<template>
  <span ref="stub"></span>
  <button @click="() => count++"></button>
</template>

<script>
import { ref, computed } from 'vue'
import { useAttributeBinding } from '/@src/util'

export default {
  setup () {
    const stub = ref(null),
          count = ref(0)

    useAttributeBinding({
      target: stub,
      attribute: 'id',
      value: computed(() => `stub-${count.value}`)
    })

    return { stub, count }
  }
}
</script>
