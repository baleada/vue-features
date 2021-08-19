<template>
  <span ref="stub">show</span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { show } from '../../../../../../src/affordances'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const stub = ref(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          }

    show({
      element: stub,
      condition: isShown,
    });

    (window as unknown as WithGlobals).testState =  { toggle }

    return { stub, isShown }
  }
})
</script>
