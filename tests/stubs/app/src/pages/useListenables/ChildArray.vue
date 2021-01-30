<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script>
import { computed } from 'vue'
import { useListenables } from '@src/affordances'

export default {
  props: ['els', 'counts', 'setCounts'],
  setup ({ els, setCounts }) {
    useListenables({
      target: computed(() => els),
      listenables: {
        click: {
          targetClosure: ({ target, index }) => event => setCounts(index)
        }
      }
    })
  }
}
</script>
