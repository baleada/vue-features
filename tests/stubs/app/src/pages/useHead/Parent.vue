<template>
  <span></span>
  <Child v-if="childIsMounted" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Child from './Child.vue'

export default defineComponent({
  components: {
    Child,
  },
  setup () {
    const childIsMounted = ref(false)

    window.testState =  { childIsMounted }
    
    return { childIsMounted }
  }
})
</script>
