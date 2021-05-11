<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { ref } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null)

    bindAttributeOrProperty({
      target: stub,
      key: 'ariaLabel',
      value: 'stub'
    })

    return { stub }
  }
}
</script>
