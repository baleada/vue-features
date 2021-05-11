<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useSingleTarget } from '../../../../../../src/util'

export default {
  setup () {
    const stub = ref(null)

    const meta = useSingleTarget()

    // @ts-ignore
    window.TEST = { ...meta, stub }

    return { stub }
  }
}
</script>
