<template>
  <div class="bg-blue-100 h-[110vh]"></div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { scrollAllowanceInjectionKey } from '../../../../../../src/extracted/manageScrollAllowance';

window.testState = {
  scrollAllowance: inject(scrollAllowanceInjectionKey),
}
</script>
