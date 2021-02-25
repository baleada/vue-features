<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script>
import { ref } from 'vue'
import { on } from '@src/affordances'

export default {
  props: ['el', 'count', 'setCount'],
  setup ({ el, count, setCount }) {
    on({
      target: ref(el),
      events: {
        click () {
          setCount(count + 1)
        }
      }
    })
  }
}
</script>
