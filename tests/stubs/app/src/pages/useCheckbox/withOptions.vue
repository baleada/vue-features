<template>
  <input type="checkbox" :ref="checkbox.root.ref()" />
</template>

<script setup lang="ts">
import { useCheckbox } from '../../../../../../src/interfaces/useCheckbox'

const checkbox = useCheckbox({ initialChecked: true, initialDeterminate: false })

window.testState = { checkbox }

</script>
