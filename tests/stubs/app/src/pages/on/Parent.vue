<template>
  <span ref="stub">{{ count }}</span>
  <button @click="() => (childIsMounted = !childIsMounted)">button</button>
  <Child
    v-if="childIsMounted"
    :el="stub"
    :count="count"
    :setCount="value => (count = value)"
  />
</template>

<script>
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
