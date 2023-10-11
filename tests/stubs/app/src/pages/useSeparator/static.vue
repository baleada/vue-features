<template>
  <div class="flex gap-4">
    <div>baleada</div>
    <div :ref="separator.root.getRef()"></div>
    <div>vue features</div>
  </div>
</template>

<script setup lang="ts">
import { useSeparator } from '../../../../../../src/interfaces/useSeparator'

const separator = useSeparator()
</script>
