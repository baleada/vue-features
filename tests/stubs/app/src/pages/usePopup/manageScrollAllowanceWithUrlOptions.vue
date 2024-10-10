<template>
  <WithUrlOptions />
</template>

<script setup lang="tsx">
import WithUrlOptions from './withUrlOptions.vue';
import { manageScrollAllowance } from '../../../../../../src/extracted/manageScrollAllowance';

manageScrollAllowance();
</script>
