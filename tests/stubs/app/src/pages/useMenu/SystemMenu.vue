<template>
  <button :ref="menu.button.root.ref()">Open menu</button>
  <Teleport to="body">
    <div
      v-if="!menu.bar.is.removed()"
      :ref="menu.bar.root.ref()"
      class="flex flex-col max-w-md fixed top-1/2 left-1/2"
    >
      <div
        v-for="(option, index) in options"
        :key="option"
        :ref="menu.bar.items.ref(index, {
          kind: [2, 3].includes(index)
            ? 'checkbox'
            : [4, 5].includes(index)
              ? 'radio'
              : 'item',
          group: [4, 5].includes(index) ? 'my-radio-group' : undefined,
        })"
        class="p-2 outline-0 ring-0 border-0 flex gap-2 items-center"
        :class="{
          'ring-2 ring-gray-400': menu.bar.is.focused(index),
        }"
      >
        <span>{{ option }}</span>
        <span aria-hidden="true" v-if="[2, 3].includes(index) && menu.bar.is.selected(index)">✅</span>
        <span aria-hidden="true" v-if="[4, 5].includes(index) && menu.bar.is.selected(index)">🔘</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="tsx">
import { Teleport } from 'vue'
import type { Menu } from '../../../../../../src/combos/useMenu'

const { options, menu } = defineProps<{
  menu: Menu,
  renderTracker: any,
  options: string[]
}>()
</script>

<script lang="tsx">
export function toSystemMenuProps({ menu, options }: { menu: Menu, options: string[] }) {
  return {
    menu,
    options,
    renderTracker: !menu.bar.is.removed(),
  }
}
</script>
