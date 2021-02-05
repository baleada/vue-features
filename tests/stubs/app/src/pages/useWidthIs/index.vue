<template>
  <span></span>
</template>

<script>
import { computed, watchEffect } from 'vue'
import { useWidthIs } from '@src/functions/index.js'

export default {
  setup () {
    const widthIs = useWidthIs({ target: computed(() => document.querySelector('html')) })

    window.TEST = { widthIs }

    watchEffect(() => {
      console.log(
        Object.entries(widthIs)
          .reduce((log, [name, is]) => ({ ...log, [name]: is.value }), {})
      )
    })
  }
}
</script>
