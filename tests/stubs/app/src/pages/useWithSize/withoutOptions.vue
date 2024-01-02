<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, computed } from 'vue'
import { useWithSize } from '../../../../../../src/extensions'

export default defineComponent({
  setup () {
    const size = useWithSize(computed(() => document.querySelector('html') as HTMLElement))

    onMounted(() => {
      ;(document.querySelector('html') as HTMLElement).style.height = '100vh'
      ;(document.querySelector('html') as HTMLElement).style.width = '100vw'
    })

    window.testState = { size }

    onMounted(() => watch(
      () => size.borderBox.value,
      () => {
        console.log(size.orientation.value)
      }
    ))
  }
})
</script>
