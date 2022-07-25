<template>
  <NestedSharedOnChild />
</template>

<script setup lang="ts">
import { WithGlobals } from '../../../../../fixtures/types';
import NestedSharedOnChild from './NestedSharedOnChild.vue'
import { shareButtonOn } from '../../../../../../src/extracted/shareButtonOn'

shareButtonOn()
</script>
