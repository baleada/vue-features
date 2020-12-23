<template>
  <span ref="stub" />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useIds } from '/@src/util'

export default {
  setup () {
    const stub = ref(null),
          ids = useIds({ target: stub }),
          id = computed(() => ids.value[0])

    onMounted(() => window.TEST = { id })

    return {
      stub,
      id
    }
  }
}
</script>
