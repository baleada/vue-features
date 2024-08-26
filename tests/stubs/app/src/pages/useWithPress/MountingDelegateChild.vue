<template>
  <button ref="element">
    Child
  </button>
  <MountingDelegateGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'
import MountingDelegateGrandchildVue from './MountingDelegateGrandchild.vue';

const element = ref()
const count = ref(0)
const withPress = useWithPress(element)

const mountGrandchild = ref(false)

watch(
  withPress.firstPress,
  () => {
    count.value++
  }
)

watch(
  withPress.release,
  () => {
    console.log((withPress.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
    mountGrandchild.value = !mountGrandchild.value
  }
)

window.testState.child = { element, count }
</script>
