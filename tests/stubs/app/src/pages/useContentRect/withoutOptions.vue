<template>
  <span></span>
</template>

<script lang="ts">
import { computed, watch, readonly, onMounted } from 'vue'
import { useContentRect } from '../../../../../../src/functions/index.js'

export default {
  setup () {
    const contentRect = useContentRect()

    onMounted(() => contentRect.element.ref(document.querySelector('html')))

    window.TEST = contentRect

    watch(
      contentRect.pixels,
      () => {
        console.log(contentRect.pixels.value)
        console.log(contentRect.breaks.sm.value)
      })
  }
}
</script>
