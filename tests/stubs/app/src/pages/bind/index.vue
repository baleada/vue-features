<template>
  <span ref="stub" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bind } from '../../../../../../src/affordances'

const stub = ref(null)

bind(
  stub,
  {
    id: 'stub',
    style_backgroundColor: 'red',
    class: 'stub',
    name: ref(undefined),
  }
)
</script>
