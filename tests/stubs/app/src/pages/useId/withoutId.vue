<template>
  <span ref="stub" />
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useId } from '../../../../../../src/util'

export default {
  setup () {
    const stub = ref(null),
          id = useId({ target: stub })

    onMounted(() => window.TEST = { id })

    return {
      stub,
    }
  }
}
</script>
