<template>
  <span />
</template>

<script setup lang="ts">
import { useQuery } from '../../../../../../src/extracted/useQuery'

const query = useQuery()

window.testState =  { query }
</script>
