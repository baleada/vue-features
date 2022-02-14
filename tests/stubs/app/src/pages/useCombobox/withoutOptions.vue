<template>
  <div class="flex flex-col gap-8 p-10">
    <input :ref="combobox.textbox.root.ref" type="text" />
    <div
      v-show="combobox.listbox.is.opened()"
      :ref="combobox.listbox.root.ref"
      class="flex gap-0.5 flex-col max-w-md"
    >
      <div
        v-for="(option, index) in options"
        :ref="combobox.listbox.options.getRef(index)"
        class="p-2 outline-0 ring-0 border-0 transition"
        :class="{
          'ring-2 ring-gray-400': combobox.listbox.is.focused(index),
          'ring-2 ring-green-500': combobox.listbox.is.selected(index),
          'absolute h-0 opacity-0': combobox.listbox.is.disabled(index),
        }"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { optionMetadata } from '../useListbox/optionMetadata'
import { useCombobox } from '../../../../../../src/combos/useCombobox'
import { names } from '@alexvipond/mulago-foundation-portfolio'

const combobox = useCombobox()

const options = names.slice(0, 10)

const selectedOption = computed(() => options[combobox.listbox.selected.value.newest])

watch(
  selectedOption,
  () => {
    combobox.textbox.text.value.complete(selectedOption.value, { select: 'completionEnd' })
  }
)
</script>
