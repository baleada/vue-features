<template>
  <div class="flex flex-col gap-8 p-10">
    <div class="flex gap-2">
      <input :ref="combobox.textbox.root.ref()" type="text" />
      <button :ref="combobox.button.root.ref()">
        Open
      </button>
    </div>
    <div
      v-if="!combobox.listbox.is.removed()"
      :ref="combobox.listbox.root.ref()"
      class="flex gap-0.5 flex-col max-w-md"
    >
      <div
        v-for="(option, index) in options"
        :ref="combobox.listbox.options.ref(index)"
        class="p-2 outline-0 ring-0 border-0 transition"
        :class="{
          'ring-2 ring-gray-400': combobox.listbox.is.focused(index),
          'ring-2 ring-green-500': combobox.listbox.is.selected(index),
          'hidden': combobox.listbox.is.disabled(index),
        }"
      >
        {{ option }}
      </div>
    </div>
    <button>focus target</button>
  </div>
</template>

<script setup lang="ts">
import { useCombobox } from '../../../../../../src/combos/useCombobox'
import { names } from '@alexvipond/mulago-foundation-portfolio'
import { getOptions } from '../../getParam'

const combobox = useCombobox(getOptions())

const options = names.slice(0, 10)

window.testState =  { combobox }
</script>
