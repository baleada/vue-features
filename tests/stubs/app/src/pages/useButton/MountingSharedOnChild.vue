<template>
  <button :ref="button.root.getRef()">
    Child
  </button>
  <MountingSharedOnGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useButton } from '../../../../../../src/interfaces/useButton'
import { WithGlobals } from '../../../../../fixtures/types';
import MountingSharedOnGrandchildVue from './MountingSharedOnGrandchild.vue';

const button = useButton()

const mountGrandchild = ref(false)

watch(
  button.event,
  () => {
    console.log((button.event.value.target as HTMLButtonElement).textContent)
    mountGrandchild.value = !mountGrandchild.value
  }
)
</script>
