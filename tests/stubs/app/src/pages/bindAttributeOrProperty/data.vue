<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

export default defineComponent({
  setup () {
    const stub = ref(null)

    bindAttributeOrProperty({
      element: stub,
      key: 'dataLabel',
      value: 'stub',
      watchSources: [],
    })

    return { stub }
  }
})
</script>
