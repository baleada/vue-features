<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { ref } from 'vue'
import { bindStyle } from '../../../../../../src/affordances'

export default {
  setup () {
    const stub = ref(null)

    bindStyle({
      target: stub,
      property: 'backgroundColor',
      value: 'red'
    })

    return { stub }
  }
}
</script>
