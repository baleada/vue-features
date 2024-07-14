<template>
  <button ref="element">
    Child
  </button>
  <MountingProvideWithPressOnGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'
import MountingProvideWithPressOnGrandchildVue from './MountingProvideWithPressOnGrandchild.vue';

const element = ref()
const withPress = useWithPress(element)

const mountGrandchild = ref(false)

watch(
  withPress.release,
  () => {
    console.log((withPress.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
    mountGrandchild.value = !mountGrandchild.value
  }
)
</script>
