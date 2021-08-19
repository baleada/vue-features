<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/affordances/bindAttributeOrProperty'

export default defineComponent({
  setup () {
    const stub = ref(null)

    bindAttributeOrProperty({
      element: stub,
      key: 'ariaLabel',
      value: 'stub',
      watchSources: [],
    })

    return { stub }
  }
})
</script>
