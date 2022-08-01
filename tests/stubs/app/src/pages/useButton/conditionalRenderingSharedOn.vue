<template>
  <ConditionalRenderingSharedOnChild />
</template>

<script setup lang="ts">
import { WithGlobals } from '../../../../../fixtures/types';
import ConditionalRenderingSharedOnChild from './ConditionalRenderingSharedOnChild.vue'
import { shareButtonOn } from '../../../../../../src/extracted/shareButtonOn'

shareButtonOn()
</script>
