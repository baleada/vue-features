<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script>
import { ref } from 'vue'
import { useListenables } from '/@src/affordances'

export default {
  props: ['el', 'count', 'setCount'],
  setup ({ el, count, setCount }) {
    useListenables({
      target: ref(el),
      listenables: {
        click () {
          setCount(count + 1)
        }
      }
    })
  }
}
</script>
