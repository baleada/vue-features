<template>
  <button ref="element">
    Child
  </button>
  <MountingProvidePressingOnGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePressing } from '../../../../../../src/extensions/usePressing'
import MountingProvidePressingOnGrandchildVue from './MountingProvidePressingOnGrandchild.vue';

const element = ref()
const pressing = usePressing(element)

const mountGrandchild = ref(false)

watch(
  pressing.release,
  () => {
    console.log((pressing.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
    mountGrandchild.value = !mountGrandchild.value
  }
)
</script>
