<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { on } from '../../../../../../src/affordances'

export default {
  props: ['els', 'counts', 'setCounts'],
  setup ({ els, setCounts }) {
    on({
      target: computed(() => els),
      events: {
        click: {
          targetClosure: ({ target, index }) => event => setCounts(index)
        }
      }
    })
  }
}
</script>
