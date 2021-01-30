<template>
  <span ref="stub"></span>
</template>

<script>
import { ref } from 'vue'
import { useTarget } from '@src/util'

export default {
  setup () {
    const stub = ref(null)

    const meta = useTarget('single')

    window.TEST = { ...meta, stub }

    return { stub }
  }
}
</script>
