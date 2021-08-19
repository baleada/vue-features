<template>
  <span></span>
</template>

<script lang="ts">
import { computed, watch, readonly, onMounted } from 'vue'
import { useContentRect } from '../../../../../../src/functions/index.js'

export default defineComponent({
  setup () {
    const contentRect = useContentRect({ breakpoints: { 'stub': 420 } })

    onMounted(() => contentRect.element.ref(document.querySelector('html')))

    (window as unknown as WithGlobals).testState =  contentRect

    watch(
      contentRect.pixels,
      () => {
        console.log(contentRect.pixels.value)
        console.log(contentRect.breaks.stub.value)
      })
  }
})
</script>
