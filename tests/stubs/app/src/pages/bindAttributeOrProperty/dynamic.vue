<template>
  <span ref="stub">stub</span>
  <button @click="() => count++">button</button>
</template>

<script>
import { ref, computed } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null),
          count = ref(0)

    bindAttributeOrProperty({
      target: stub,
      key: 'id',
      value: computed(() => `stub-${count.value}`)
    })

    return { stub, count }
  }
}
</script>
