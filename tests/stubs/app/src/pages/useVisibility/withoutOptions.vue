<template>
  <div style="height: 110vh;"></div>
  <span ref="stub">useVisibility</span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useVisibility } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const stub = ref<HTMLElement>(null),
          visibility = useVisibility(stub);

    (window as unknown as WithGlobals).testState = { visibility }
    
    return { stub }
  }
})
</script>
