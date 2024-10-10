<template>
  <Scoped v-if="scopedIsRendered" />
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import Scoped from './Scoped.vue';
import { manageScrollAllowance } from '../../../../../../src/extracted/manageScrollAllowance';

const scopedIsRendered = ref(true);

manageScrollAllowance();

window.testState = { scopedIsRendered };
</script>
