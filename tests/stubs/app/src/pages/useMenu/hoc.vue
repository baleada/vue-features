<template>
  <SystemMenu
    :options="[
      'Option #1',
      'Option #2',
      'Option #3',
      'Option #4',
      'Option #5',
      'Option #6',
    ]"
  />
</template>

<script setup lang="tsx">
import { watch } from 'vue';
import { createSystemMenu } from './createSystemMenu'

const SystemMenu = createSystemMenu({
  menu: {
    bar: { multiselectable: true }
  },
  setup(props, ctx, { menu }) {
    menu.bar.select.exact

    watch(
      menu.bar.focused,
      (focused) => {
        console.log('focused', focused)
      }
    )
  },
})
</script>
