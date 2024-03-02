<template>
  <div
    :ref="menubar.root.ref()"
    class="flex flex-col max-w-md fixed top-1/2 left-1/2"
  >
    <div
      v-for="(option, index) in optionMetadata"
      :key="option"
      :ref="menubar.items.ref(index, {
        kind: [2, 3].includes(index)
          ? 'checkbox'
          : [4, 5].includes(index)
            ? 'radio'
            : 'item',
        groupName: [4, 5].includes(index) ? 'my-radio-group' : undefined,
      })"
      class="p-2 outline-0 ring-0 border-0 flex gap-2 items-center"
      :class="{
        'ring-2 ring-gray-400': menubar.is.focused(index),
      }"
    >
      <span>{{ option }}</span>
      <span aria-hidden="true" v-if="[2, 3].includes(index) && menubar.is.selected(index)">✅</span>
      <span aria-hidden="true" v-if="[4, 5].includes(index) && menubar.is.selected(index)">🔘</span>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { useMenubar } from '../../../../../../src/interfaces/useMenubar'
import { optionMetadata } from '../useListbox/optionMetadata'
import  { getOptions } from '../../getParam'

const menubar = useMenubar(getOptions());

window.testState = { menubar }
</script>
