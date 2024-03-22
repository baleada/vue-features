<template>
  <button :ref="button.root.ref()">button</button>
</template>

<script setup lang="ts">
import { useButton } from '../../../../../../src/interfaces/useButton'
import { useButtonStorage } from '../../../../../../src/extensions/useButtonStorage'

const button = useButton({ toggles: true })

window.testState= { button, storage: useButtonStorage(button) }

</script>
