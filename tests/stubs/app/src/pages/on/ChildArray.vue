<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { on } from '../../../../../../src/affordances'

export default defineComponent({
  props: ['els', 'counts', 'setCounts'],
  setup ({ els, setCounts }) {
    onMounted(() => console.log(els))
    on<'click'>({
      element: computed(() => els),
      effects: defineEffect => [
        defineEffect(
          'click',
          {
            createEffect: ({ index }) => () => setCounts(index)
          }
        )
      ]
    })
  }
})
</script>
