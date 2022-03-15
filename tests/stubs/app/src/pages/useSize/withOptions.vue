<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSize } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const size = useSize(
            computed(() => document.querySelector('html')),
            { breakpoints: { 'stub': 420 } }
          )

    ;(window as unknown as WithGlobals).testState = { size }
  }
})
</script>
