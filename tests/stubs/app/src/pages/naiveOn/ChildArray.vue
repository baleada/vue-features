<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { naiveOn as on } from '../../../../../../src/affordances'

export default {
  props: ['els', 'counts', 'setCounts'],
  setup ({ els, setCounts }) {
    on({
      target: computed(() => els),
      events: {
        mouseenter: {
          targetClosure: ({ target, index }) => event => setCounts(index)
        }
      }
    })
  }
}
</script>
