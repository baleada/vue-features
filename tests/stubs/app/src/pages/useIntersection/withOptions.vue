<template>
  <div ref="root" style="height: 100px; width: 200px; border: 1px solid #eee; overflow-y: scroll;">
    <div style="height: 200px;"></div>
    <span ref="stub" style="display: block; width: 100px">useIntersection</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useIntersection } from '../../../../../../src/extensions'

export default defineComponent({
  setup () {
    const root = ref<HTMLElement>(null),
          stub = ref<HTMLElement>(null),
          intersectable = useIntersection(
            stub,
            {
              observer: {
                root,
                rootMargin: '0px',
                threshold: 0.5
              }
            }
          )

    window.testState = { intersectable }
    
    return { root, stub }
  }
})
</script>
