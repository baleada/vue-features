<template>
  <p :ref="elRef" />
  <DefinedComponent :ref="componentRef" />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import DefinedComponent from '../createComponentRef/DefinedComponent.vue'
import { createMaybeComponentRef } from '../../../../../../src/transforms/createMaybeComponentRef'

const el = shallowRef(null)
const elFnRef = (e) => el.value = e

const component = shallowRef(null)
const componentFnRef = (e) => component.value = e

const elRef = createMaybeComponentRef(elFnRef)
const componentRef = createMaybeComponentRef(componentFnRef)

window.testState = { el, component }
</script>
