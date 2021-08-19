<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted } from 'vue'
import { useContentRect } from '../../../../../../src/functions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const contentRect = useContentRect()

    onMounted(() => {
      contentRect.root.ref(document.querySelector('html'))
    });

    (window as unknown as WithGlobals).testState = contentRect

    onMounted(() => watch(
      () => contentRect.pixels.value,
      () => {
        console.log(contentRect.pixels.value?.width),
        console.log(contentRect.breaks.sm.value)
      }
    ))
  }
})
</script>
