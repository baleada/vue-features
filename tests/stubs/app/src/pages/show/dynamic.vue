<template>
  <span ref="stub">show</span>
</template>

<script lang="ts">
import { ref } from 'vue'
import { show } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          }

    show({
      target: stub,
      condition: isShown,
    })

    window.TEST = { toggle }

    return { stub, isShown }
  }
}
</script>
