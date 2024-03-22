<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useWithSize } from '../../../../../../src/extensions'

export default defineComponent({
  setup () {
    const size = useWithSize(
            computed(() => document.querySelector('html') as HTMLElement),
            { breakpoints: { 'stub': 420 } }
          )

    window.testState = { size }
  }
})
</script>
