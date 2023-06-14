<template>
  <input type="checkbox" :ref="checkbox.root.getRef()" />
</template>

<script setup lang="ts">
import { useCheckbox } from '../../../../../../src/interfaces/useCheckbox'

const checkbox = useCheckbox({ initialChecked: true })

window.testState = { checkbox }

</script>
