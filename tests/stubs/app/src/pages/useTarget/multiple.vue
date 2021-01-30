<template>
  <span ref="stub0" class="0"></span>
  <span ref="stub1" class="1"></span>
  <span ref="stub2" class="2"></span>
</template>

<script>
import { ref } from 'vue'
import { useTarget } from '@src/util'

export default {
  setup () {
    const stub0 = ref(null),
          stub1 = ref(null),
          stub2 = ref(null)

    const meta = useTarget('multiple')

    window.TEST = { ...meta, stub0, stub1, stub2 }

    return { stub0, stub1, stub2 }
  }
}
</script>
