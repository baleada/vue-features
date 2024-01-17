<template>
  <div class="flex flex-col gap-8 p-10">
    <button :ref="menu.button.root.ref()">Open menu</button>
    <div
      v-if="!menu.bar.is.removed()"
      :ref="menu.bar.root.ref()"
      class="flex flex-col max-w-md"
    >
      <div
        v-for="(option, index) in optionMetadata"
        :ref="menu.bar.items.ref(index, { kind: index > 2 ? 'checkbox' : 'item' })"
        class="p-2 outline-0 ring-0 border-0"
        :class="{
          'ring-2 ring-gray-400': menu.bar.is.focused(index),
          'ring-2 ring-green-500': menu.bar.is.selected(index),
        }"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { optionMetadata } from '../useListbox/optionMetadata'
import { useMenu } from '../../../../../../src/combos/useMenu'

const menu = useMenu()

watch(
  menu.bar.press,
  () => console.log('pressed', menu.bar.pressed.value)
)
watch(
  menu.bar.release,
  () => console.log('released', menu.bar.released.value)
)
</script>
