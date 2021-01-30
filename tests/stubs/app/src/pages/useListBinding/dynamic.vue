<template>
  <span ref="stub" class="stub"></span>
  <button @click="() => (color = 'blue')"></button>
</template>

<script>
import { ref, computed } from 'vue'
import { useListBinding } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null),
          color = ref('red')

    useListBinding({
      target: stub,
      list: 'class',
      value: color
    })

    return { stub, color }
  }
}
</script>
