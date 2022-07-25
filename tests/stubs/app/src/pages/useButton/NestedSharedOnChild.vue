<template>
  <button :ref="button.root.ref">
    Child
  </button>
  <NestedSharedOnGrandchildVue v-if="showGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useButton } from '../../../../../../src/interfaces/useButton'
import { WithGlobals } from '../../../../../fixtures/types';
import NestedSharedOnGrandchildVue from './NestedSharedOnGrandchild.vue';

const button = useButton()

const showGrandchild = ref(false)

watch(
  button.event,
  () => {
    console.log((button.event.value.target as HTMLButtonElement).textContent)
    showGrandchild.value = !showGrandchild.value
  }
)
</script>
