<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, computed } from 'vue'
import { useSize } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const size = useSize(computed(() => document.querySelector('html')))

    onMounted(() => {
      document.querySelector('html').style.height = '100vh'
      document.querySelector('html').style.width = '100vw'
    });

    (window as unknown as WithGlobals).testState = { size }

    onMounted(() => watch(
      () => size.rect.value,
      () => {
        console.log(size.orientation.value)
      }
    ))
  }
})
</script>
