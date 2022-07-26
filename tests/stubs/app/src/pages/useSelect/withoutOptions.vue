<template>
  <div class="flex flex-col gap-8 p-10">
    <button :ref="select.button.root.ref">Select stuff</button>
    <div
      v-if="select.listbox.rendering.is.rendered()"
      :ref="select.listbox.root.ref"
      class="flex flex-col max-w-md"
    >
      <div
        v-for="(option, index) in optionMetadata"
        :ref="select.listbox.options.getRef(index)"
        class="p-2 outline-0 ring-0 border-0"
        :class="{
          'ring-2 ring-gray-400': select.listbox.is.focused(index),
          'ring-2 ring-green-500': select.listbox.is.selected(index),
        }"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { optionMetadata } from '../useListbox/optionMetadata'
import { useSelect } from '../../../../../../src/combos/useSelect'

const select = useSelect()
</script>
