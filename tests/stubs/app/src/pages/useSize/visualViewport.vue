<template>
  <span></span>
</template>

<script lang="ts" setup>
import { watch, onMounted } from 'vue'
import { useSize } from '../../../../../../src/extensions'

const size = useSize(() => window.visualViewport)

onMounted(() => {
  ;(document.querySelector('html') as HTMLElement).style.height = '100vh'
  ;(document.querySelector('html') as HTMLElement).style.width = '100vw'
})

window.testState = { size }

watch(
  () => size.box.value,
  () => {
    console.log(size.orientation.value)
  }
)
</script>
