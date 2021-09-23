<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted } from 'vue'
import { useSize } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const contentRect = useSize()

    onMounted(() => {
      document.querySelector('html').style.height = '100vh'
      document.querySelector('html').style.width = '100vw'
      contentRect.root.ref(document.querySelector('html'))
    });

    (window as unknown as WithGlobals).testState = contentRect

    onMounted(() => watch(
      () => contentRect.pixels.value,
      () => {
        console.log(contentRect.orientation.value)
      }
    ))
  }
})
</script>
