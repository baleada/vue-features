<template>
  <button ref="element">
    Child
  </button>
  <MountingDelegateGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'
import MountingDelegateGrandchildVue from './MountingDelegateGrandchild.vue';

const element = ref()
const count = ref(0)
const press = usePress(element)

const mountGrandchild = ref(false)

watch(
  press.firstDescriptor,
  () => {
    count.value++
  }
)

watch(
  press.status,
  status => {
    if (status !== 'released') return
    mountGrandchild.value = !mountGrandchild.value
  }
)

window.testState.child = { element, count }
</script>
