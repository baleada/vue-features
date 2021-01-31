<template>
  <!-- Element to wait for, so mounting can be proven -->
  <div></div>
</template>

<script>
import { ref } from 'vue'
import { useListeners } from '@src/affordances'

export default {
  props: ['el', 'getCount', 'setCount'],
  setup ({ el, getCount, setCount }) {
    useListeners({
      target: ref(el),
      listeners: {
        click () {
          console.log('click')
          setCount(getCount() + 1)
        },
        mousedown () {
          console.log('mousedown')
        }
      }
    })
  }
}
</script>
