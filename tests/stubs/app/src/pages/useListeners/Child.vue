<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script>
import { ref } from 'vue'
import { useListeners } from '@src/affordances'

export default {
  props: ['el', 'count', 'setCount'],
  setup ({ el, count, setCount }) {
    useListeners({
      target: ref(el),
      listeners: {
        click () {
          setCount(count + 1)
        }
      }
    })
  }
}
</script>
