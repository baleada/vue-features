<template>
  <button :ref="button.root.ref()">button</button>
</template>

<script setup lang="ts">
import { useButton } from '../../../../../../src/interfaces/useButton'

const button = useButton({ toggles: true })

window.testState= { button }

</script>
