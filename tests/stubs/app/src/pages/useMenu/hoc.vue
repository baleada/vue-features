<template>
  <component :is="Menu({
    items,
    menu: { bar: { multiselectable: true } },
    getMeta: {
      menuButtonRoot: () => ({
        label: 'my menu',
      })
    },
    extend({ menu }) {
      watch(
        menu.bar.focused,
        (focused) => {
          console.log('focused', focused)
        }
      )
    },
  })">
    <template v-slot:label>My menu</template>
    <template v-slot:button-label>Open menu</template>
    <template v-slot:item="{ item }">
      <span class="bg-blue-100">{{ item }}</span>
    </template>
  </component>

</template>

<script setup lang="tsx">
import { ref, watch } from 'vue';
import { createMenu as Menu } from './createMenu'

const items = ref([
  'Option #6',
  'Option #1',
  'Option #2',
  'Option #3',
  'Option #4',
  'Option #5',
])
</script>
