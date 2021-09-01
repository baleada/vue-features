<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

export default defineComponent({
  setup () {
    const stub = ref(null)

    bindStyle({
      element: stub,
      property: 'backgroundColor',
      value: 'red',
      watchSources: [],
    })

    return { stub }
  }
})
</script>
