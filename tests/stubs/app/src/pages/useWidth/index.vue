<template>
  <span></span>
</template>

<script>
import { computed, watch, readonly, onMounted } from 'vue'
import { useWidth } from '@src/functions/index.js'

export default {
  setup () {
    const width = useWidth()

    onMounted(() => width.ref()(document.querySelector('html')))

    window.TEST = { width }

    watch(
      width.pixels,
      () => {
        console.log(width.pixels.value)
        console.log(width.breaks.sm.value)
      })
  }
}
</script>
