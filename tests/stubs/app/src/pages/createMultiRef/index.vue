<template>
  <div :ref="multiRef"></div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { createMultiRef } from '../../../../../../src/transforms/createMultiRef'

const el1 = shallowRef(null)
const el2 = shallowRef(null)

const fnRef1 = (el) => el1.value = el
const fnRef2 = (el) => el2.value = el

const multiRef = createMultiRef(fnRef1, fnRef2)

window.testState = { el1, el2 }
</script>
