<template>
  <span></span>
</template>

<script>
import { computed, watchEffect } from 'vue'
import { useBreakpointIs } from '@src/functions/index.js'

export default {
  setup () {
    const breakpointIs = useBreakpointIs({ target: computed(() => document.querySelector('html')) })

    window.TEST = { breakpointIs }

    watchEffect(() => {
      console.log(
        Object.entries(breakpointIs)
          .reduce((log, [name, is]) => ({ ...log, [name]: is.value }), {})
      )
    })
  }
}
</script>
