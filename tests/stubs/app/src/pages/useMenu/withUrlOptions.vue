<template>
  <button id="previous">previous</button>
  <div class="flex flex-col gap-8 p-10">
    <SystemMenu
      v-bind="toSystemMenuProps({
        menu,
        options: optionMetadata,
      })"
    />
  </div>
  <button id="next">next</button>
</template>

<script setup lang="tsx">
import { optionMetadata } from '../useListbox/optionMetadata'
import { useMenu } from '../../../../../../src/combos/useMenu'
import SystemMenu, { toSystemMenuProps } from './SystemMenu.vue'
import { getOptions } from '../../getParam';

const menu = useMenu(getOptions())

window.testState = { menu }
</script>
