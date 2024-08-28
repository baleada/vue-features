<template>
  <div class="flex flex-col gap-8 p-10">
    <SystemMenu
      v-bind="toSystemMenuProps({
        menu,
        options: optionMetadata,
      })"
    />
  </div>
</template>

<script setup lang="tsx">
import { watch } from 'vue';
import { optionMetadata } from '../useListbox/optionMetadata'
import { useMenu } from '../../../../../../src/combos/useMenu'
import SystemMenu, { toSystemMenuProps } from './SystemMenu.vue'

const menu = useMenu()

// React to clicks (i.e. press & release), which `useMenu` tracks
// consistently across browsers, devices, and pointer types.
watch(
  menu.bar.releaseDescriptor,
  () => {
    const releasedOption = optionMetadata[menu.bar.released.value]
    console.log(`${releasedOption} was clicked`)
  }
)

// For menus with type="checkbox" on all or some of the items, react
// whenever the checked state of any item changes.
watch(
  menu.bar.selected,
  selected => {
    console.log('selected picks:')
    for (const pick of selected) {
      console.log(optionMetadata[pick])
    }
  }
)
</script>
