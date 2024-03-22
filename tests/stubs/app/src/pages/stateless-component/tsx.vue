<template>
  <Stateless
    v-for="(num, index) in new Array(60).fill(0)"
    :key="index"
    :ref="el => { if (index === 20 - 1) console.log(Date.now() - start) }"
  />
</template>

<script setup lang="tsx">
import Stateless from './StatelessTSX'
const start = Date.now()
</script>
