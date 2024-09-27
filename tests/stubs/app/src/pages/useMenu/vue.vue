<template>
  <Menu 
    :items
    :menu="{ bar: { multiselectable: true } }"
    :getMeta="{ menuButtonRoot: () => ({ label: 'my menu' }) }"
    @setup="({ menu }) => {
      watch(
        menu.bar.focused,
        (focused) => {
          console.log('focused', focused)
        }
      )
    }"
  >
    <template v-slot:label>My menu</template>
    <template v-slot:button-label>Open menu</template>
    <template v-slot:item="{ item }">
      <span class="bg-blue-100">{{ item }}</span>
    </template>
  </Menu>
</template>

<script setup lang="tsx">
import { ref, watch } from 'vue';
import Menu from './Menu.vue'

const items = ref([
  'Option #6',
  'Option #1',
  'Option #2',
  'Option #3',
  'Option #4',
  'Option #5',
])
</script>
