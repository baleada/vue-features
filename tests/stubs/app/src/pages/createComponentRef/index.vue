<template>
  <DefinedComponent :ref="elRef" />
  <DefinedComponent :ref="fooRef" />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import DefinedComponent from './DefinedComponent.vue'
import { createComponentRef } from '../../../../../../src/transforms/createComponentRef'

const el = shallowRef(null)
const elFnRef = (e) => el.value = e

const foo = shallowRef(null)
const fooFnRef = (e) => foo.value = e

const elRef = createComponentRef(elFnRef)
const fooRef = createComponentRef(fooFnRef, { refName: 'foo' })

window.testState = { el, foo }
</script>
