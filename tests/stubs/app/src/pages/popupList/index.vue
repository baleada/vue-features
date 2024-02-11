<template>
  <div class="flex flex-col gap-8 p-10">
    <button :ref="select.button.root.ref()">Select stuff</button>
    <Teleport to="body">
      <div
        v-if="!select.listbox.is.removed()"
        :ref="select.listbox.root.ref()"
        class="flex flex-col max-w-md"
      >
        <div
          v-for="(option, index) in optionMetadata"
          :ref="select.listbox.options.ref(index)"
          class="p-2 outline-0 ring-0 border-0"
          :class="{
            'ring-2 ring-gray-400': select.listbox.is.focused(index),
            'ring-2 ring-green-500': select.listbox.is.selected(index),
          }"
        >
          {{ option }}
        </div>
      </div>
    </Teleport>
    <button>focus target</button>
  </div>
</template>

<script setup lang="ts">
import { Teleport } from 'vue'
import { optionMetadata } from '../useListbox/optionMetadata'
import { useSelect } from '../../../../../../src/combos/useSelect'
import { getOptions } from '../../getOptions'

const select = useSelect(getOptions())

window.testState = { select }
</script>

<style>
.opacity-0 {
  opacity: 0;
}
.opacity-100 {
  opacity: 1;
}
.duration-100 {
  transition-duration: 100ms;
}
</style>
