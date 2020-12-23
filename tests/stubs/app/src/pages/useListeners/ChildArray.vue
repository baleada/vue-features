<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script>
import { computed } from 'vue'
import { useListeners } from '/@src/affordances'

export default {
  props: ['els', 'counts', 'setCounts'],
  setup ({ els, setCounts }) {
    useListeners({
      target: computed(() => els),
      listeners: {
        click: [
          ({ el, index }) => event => {
            setCounts(index)
          }
        ]
      }
    })
  }
}
</script>
