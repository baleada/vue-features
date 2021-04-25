<template>
  <span ref="stub" class="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { bindList } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null)

    bindList({
      target: stub,
      list: 'class',
      value: 'red'
    })

    return { stub }
  }
}
</script>
