<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { on } from '../../../../../../src/affordances'

export default defineComponent({
  props: ['els', 'counts', 'setCounts'],
  setup ({ els, setCounts }) {
    on<'click'>(
      computed(() => els),
      defineEffect => [
        defineEffect(
          'click',
          {
            createEffect: index => () => setCounts(index)
          }
        )
      ]
    )
  }
})
</script>
