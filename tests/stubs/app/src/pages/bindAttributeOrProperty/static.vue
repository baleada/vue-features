<template>
  <span ref="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null)

    bindAttributeOrProperty({
      target: stub,
      key: 'id',
      value: 'stub'
    })

    return { stub }
  }
}
</script>
