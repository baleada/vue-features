<template>
  <span ref="stub" style="font-size: 52px;">{{ count }}</span>
  <button @click="() => (childIsMounted = !childIsMounted)">button</button>
  <Child
    v-if="childIsMounted"
    :el="stub"
    :getCount="() => count"
    :setCount="value => (count = value)"
  />
</template>

<script lang="ts">
import { ref, computed } from 'vue'
import Child from './Child.vue'

export default {
  components: {
    Child,
  },
  setup () {
    const stub = ref(null),
          count = ref(0),
          childIsMounted = ref(false)

    return { stub, count, childIsMounted }
  }
}
</script>
