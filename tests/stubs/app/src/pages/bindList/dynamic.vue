<template>
  <span ref="stub" class="stub"></span>
  <button @click="() => (color = 'blue')"></button>
</template>

<script>
import { ref, computed } from 'vue'
import { bindList } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null),
          color = ref('red')

    bindList({
      target: stub,
      list: 'class',
      value: color
    })

    return { stub, color }
  }
}
</script>
