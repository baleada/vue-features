<template>
  <div style="height: 110vh;"></div>
  <span ref="stub">useVisibility</span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useVisibility } from '../../../../../../src/extensions'

export default defineComponent({
  setup () {
    const stub = ref<HTMLElement>(null),
          visibility = useVisibility(stub)

    window.testState = { visibility }
    
    return { stub }
  }
})
</script>
