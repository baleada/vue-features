<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { on } from '../../../../../../src/affordances'

export default defineComponent({
  props: ['el', 'count', 'setCount'],
  setup ({ el, count, setCount }) {
    on<'click'>({
      element: ref(el),
      effects: defineEffect => [
        defineEffect(
          'click',
          () => {
            setCount(count + 1)
          }
        )
      ]
    })
  }
})
</script>
