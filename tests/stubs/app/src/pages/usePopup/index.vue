<template>
  <span ref="el"></span>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { usePopup } from '../../../../../../src/extensions/usePopup'

const el = shallowRef()

window.testState = { popup: usePopup(el) }
</script>
