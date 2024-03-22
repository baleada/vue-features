<template>
  <div class="flex flex-col max-w-md">
    <div
      class="p-2 outline-0 ring-0 border-0"
      v-for="(num, index) in new Array(100).fill(0)"
      :key="index"
    >
      {{ index }}
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';

const count = ref(0)
</script>
