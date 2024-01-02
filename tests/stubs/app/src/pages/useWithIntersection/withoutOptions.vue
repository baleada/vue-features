<template>
  <div style="height: 110vh;"></div>
  <span ref="stub" style="display: block; width: 100px">useWithIntersection</span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useWithIntersection } from '../../../../../../src/extensions'

export default defineComponent({
  setup () {
    const stub = ref<HTMLElement>(null),
          withIntersection = useWithIntersection(stub)

    window.testState = { withIntersection }
    
    return { stub }
  }
})
</script>
