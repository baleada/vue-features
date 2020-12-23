<template>
  <span ref="stub" />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useIds } from '/@src/util'

export default {
  setup () {
    const stub = ref(null),
          id = useIds({ target: stub })

    onMounted(() => window.TEST = { id })

    return {
      stub,
    }
  }
}
</script>
