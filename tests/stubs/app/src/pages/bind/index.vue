<template>
  <span ref="stub" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bind } from '../../../../../../src/affordances'


export default defineComponent({
  setup () {
    const stub = ref(null)

    bind({
      element: stub,
      values: {
        id: 'stub',
        style_backgroundColor: 'red',
        class: 'stub',
        name: ref(undefined),
      }
    })

    return { stub }
  }
})
</script>
