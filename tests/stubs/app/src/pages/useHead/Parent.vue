<template>
  <span></span>
  <Child v-if="childIsMounted" />
</template>

<script lang="ts">
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
