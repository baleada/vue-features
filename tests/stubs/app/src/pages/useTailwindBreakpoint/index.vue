<template>
  <span></span>
</template>

<script>
import { computed, watchEffect } from 'vue'
import { useTailwindBreakpoint } from '@src/functions/index.js'

export default {
  setup () {
    const breakpoint = useTailwindBreakpoint({ target: computed(() => document.querySelector('html')) })

    window.TEST = { breakpoint }

    watchEffect(() => console.log(breakpoint.value))
  }
}
</script>
