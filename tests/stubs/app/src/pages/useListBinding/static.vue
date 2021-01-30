<template>
  <span ref="stub" class="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { useListBinding } from '@src/affordances'

export default {
  setup () {
    const stub = ref(null)

    useListBinding({
      target: stub,
      list: 'class',
      value: 'red'
    })

    return { stub }
  }
}
</script>
