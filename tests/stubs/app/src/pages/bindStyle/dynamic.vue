<template>
  <span ref="stub"></span>
  <button @click="() => (color = 'blue')"></button>
</template>

<script>
import { ref, computed } from 'vue'
import { bindStyle } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null),
          color = ref('red')

    bindStyle({
      target: stub,
      property: 'backgroundColor',
      value: color
    })

    return { stub, color }
  }
}
</script>
