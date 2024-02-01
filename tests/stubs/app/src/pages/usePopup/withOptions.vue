<template>
  <input type="text">
  <span ref="el">
    <button>first</button>
    <button>second</button>
    <button>third</button>
  </span>
  <input type="text">
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { usePopup } from '../../../../../../src/extensions/usePopup'

const el = shallowRef()

window.testState = { popup: usePopup(el, { initialStatus: 'opened', trapsFocus: true }) }
</script>
