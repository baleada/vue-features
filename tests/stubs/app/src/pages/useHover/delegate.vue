<template>
  <WithUrlOptions />
</template>

<script setup lang="tsx">
import WithUrlOptions from './withUrlOptions.vue'
import { delegateHover } from '../../../../../../src/extracted/delegateHover'

delegateHover()
</script>
