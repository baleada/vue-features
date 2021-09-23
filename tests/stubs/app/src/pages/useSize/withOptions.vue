<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSize } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const contentRect = useSize(
            () => document.querySelector('html'),
            { breakpoints: { 'stub': 420 } }
          );

    (window as unknown as WithGlobals).testState =  contentRect
  }
})
</script>
