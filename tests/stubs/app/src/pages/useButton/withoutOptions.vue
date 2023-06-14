<template>
  <button :ref="button.root.getRef()">button</button>
</template>

<script setup lang="ts">
import { useButton } from '../../../../../../src/interfaces/useButton'

const button = useButton()

window.testState= { button }

</script>
