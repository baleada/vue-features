<template>
  <input type="text" ref="stub" />
</template>

<script lang="ts">
import { ref } from 'vue'
import { model } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null),
          value = ref('')

    model({
      target: stub,
      value,
    })

    window.TEST = { value }

    return { stub }
  }
}
</script>
