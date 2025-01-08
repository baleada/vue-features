<template>
  <WithUrlOptions />
</template>

<script setup lang="tsx">
import WithUrlOptions from './withUrlOptions.vue'
import { delegate } from '../../../../../../src/extracted/delegate'

delegate()
</script>
