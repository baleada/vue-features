<template>
  <span></span>
  <Child v-if="childIsMounted" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { WithGlobals } from '../../../../../fixtures/types';
import Child from './Child.vue'

export default defineComponent({
  components: {
    Child,
  },
  setup () {
    const childIsMounted = ref(false)

    ;(window as unknown as WithGlobals).testState =  { childIsMounted }
    
    return { childIsMounted }
  }
})
</script>
