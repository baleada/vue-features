<template>
  <input type="text" id="before">
  <span ref="el">
    <button>first</button>
    <button>second</button>
    <button>third</button>
  </span>
  <input type="text" id="after">
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { usePopup } from '../../../../../../src/extensions/usePopup'
import { getOptions } from '../../getParam';

const el = shallowRef()

window.testState = { popup: usePopup(el, getOptions()) }
</script>
