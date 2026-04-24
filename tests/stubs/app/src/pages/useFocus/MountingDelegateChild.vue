<template>
  <button ref="element">
    Child
  </button>
  <MountingDelegateGrandchild v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocus } from '../../../../../../src/extensions/useFocus'
import MountingDelegateGrandchild from './MountingDelegateGrandchild.vue'

const element = ref()
const focus = useFocus(element)

const mountGrandchild = ref(false)

window.testState.child = { element, focus, mountGrandchild }
</script>
