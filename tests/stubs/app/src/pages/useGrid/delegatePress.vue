<template>
  <WithUrlOptions />
</template>

<script setup lang="tsx">
import WithUrlOptions from './withUrlOptions.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress';

delegatePress();
</script>
