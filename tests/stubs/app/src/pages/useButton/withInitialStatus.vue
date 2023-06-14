<template>
  <button :ref="button.root.getRef()">button</button>
</template>

<script setup lang="ts">
import { useButton } from '../../../../../../src/interfaces/useButton'

const button = useButton({ toggles: true, initialStatus: 'on' })

window.testState= { button }

</script>
