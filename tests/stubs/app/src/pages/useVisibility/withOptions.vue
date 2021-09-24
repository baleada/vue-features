<template>
  <div ref="root" style="height: 100px; border: 1px solid #eee; overflow-y: scroll;">
    <div style="height: 200px;"></div>
    <span ref="stub">useVisibility</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useVisibility } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const root = ref<HTMLElement>(null),
          stub = ref<HTMLElement>(null),
          visibility = useVisibility(
            stub,
            {
              observer: {
                root,
                rootMargin: '0px',
                threshold: 0.5
              }
            }
          );

    (window as unknown as WithGlobals).testState = { visibility }
    
    return { root, stub }
  }
})
</script>
