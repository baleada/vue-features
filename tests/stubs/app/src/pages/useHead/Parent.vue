<template>
  <span></span>
  <Child v-if="childIsMounted" />
</template>

<script>
import { ref } from 'vue'
import Child from './Child.vue'

export default {
  components: {
    Child,
  },
  setup () {
    const childIsMounted = ref(false)

    window.TEST = { childIsMounted }
    
    return { childIsMounted }
  }
}
</script>
