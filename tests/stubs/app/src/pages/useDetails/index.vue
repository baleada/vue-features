<template>
  <span ref="identifying" />
  <span :ref="identified.root.getRef()" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDetails } from '../../../../../../src/extensions/useDetails'

const identifying = ref(null),
      identified = useDetails(identifying)

window.testState = { identifying, identified }
</script>
