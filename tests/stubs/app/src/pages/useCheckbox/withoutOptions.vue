<template>
  <input type="checkbox" :ref="checkbox.root.ref()" />
</template>

<script setup lang="ts">
import { useCheckbox } from '../../../../../../src/interfaces/useCheckbox'

const checkbox = useCheckbox()

window.testState = { checkbox }

</script>
