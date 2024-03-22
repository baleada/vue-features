<template>
  <div class="flex flex-col gap-8 p-10">
    <input :ref="combobox.textbox.root.ref({ validity })" type="text" />
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
          'ring-2 ring-red-500': combobox.listbox.is.disabled(index),
          'bg-amber-200': combobox.listbox.is.enabled(index),
        }"
      >
        {{ option }}
      </div>
    </div>
    <button>focus target</button>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { optionMetadata } from '../useListbox/optionMetadata'
import { useCombobox } from '../../../../../../src/combos/useCombobox'
import { names } from '@alexvipond/mulago-foundation-portfolio'

const combobox = useCombobox()

const options = names.slice(0, 10)

const validity = computed(() => {
  return options.includes(combobox.textbox.text.string) ? 'valid' : 'invalid'
})

const selectedOption = computed(() => options[combobox.listbox.selected.newest])

watch(
  selectedOption,
  () => {
    if (selectedOption.value) {
      combobox.complete(selectedOption.value, { select: 'completionEnd' })
    }
  }
)

window.testState =  { combobox }
</script>
