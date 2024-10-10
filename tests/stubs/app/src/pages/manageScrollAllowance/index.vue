<template>
  <Child />
</template>

<script setup lang="tsx">
import { manageScrollAllowance } from '../../../../../../src/extracted/manageScrollAllowance';
import Child from './Child.vue';

manageScrollAllowance();
</script>
