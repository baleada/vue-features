<template>
  <div style="height: 110vh;"></div>
  <span ref="stub" style="display: block; width: 100px">useIntersection</span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useIntersection } from '../../../../../../src/extensions'

export default defineComponent({
  setup () {
    const stub = ref<HTMLElement>(null),
          intersectable = useIntersection(stub)

    window.testState = { intersectable }
    
    return { stub }
  }
})
</script>
