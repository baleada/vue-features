<template>
  <button :ref="button.root.getRef()">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useButton } from '../../../../../../src/interfaces/useButton'
import { WithGlobals } from '../../../../../fixtures/types';
import { shareButtonOn } from '../../../../../../src/extracted/shareButtonOn'

const button = useButton()

watch(
  button.event,
  () => {
    console.log((button.event.value.target as HTMLButtonElement).textContent)
  }
)
</script>
