<template>
  <div class="w-screen h-screen flex items-center justify-center bg-gray-100 text-gray-900">
    <div class="w-full max-w-md flex flex-col gap-8 p-10 rounded-lg bg-white shadow-md">
      <div class="relative flex flex-col gap-2">
        <label class="text-sm font-medium" :ref="label.ref()" :for="combobox.textbox.root.id.value">Choose a recipient:</label>
        <div class="flex items-center ring-1 ring-gray-200 hover:ring-gray-300 has-[:focus]:ring-gray-300 p-1 pl-2 rounded-md">
          <input
            :ref="combobox.textbox.root.ref({
              validity,
              label: label.id.value
            })"
            type="text"
            class="min-h-full flex-1 focus:outline-none"
          />
          <button
            :ref="combobox.button.root.ref()"
            class="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          >
            🔎
          </button>
        </div>
        <div
          v-if="!combobox.listbox.is.removed()"
          :ref="combobox.listbox.root.ref()"
          class="absolute bottom-0 translate-y-full -mb-2 w-full max-w-md max-h-64 flex gap-0.5 flex-col bg-white shadow-lg rounded-md ring-1 ring-gray-200 overflow-y-scroll"
        >
          <div
            v-for="(option, index) in options"
            :ref="combobox.listbox.options.ref(index)"
            class="p-1.5"
            :class="{
              'hidden': combobox.listbox.is.disabled(index),
            }"
          >
            <div
              class="p-2 rounded-md"
              :class="{
                'bg-gray-100': combobox.listbox.is.focused(index),
                'bg-blue-100': combobox.listbox.is.selected(index),
                'hidden': combobox.listbox.is.disabled(index),
              }"
            >
              {{ option }}
            </div>
          </div>
        </div>
      </div>
      <!-- <button>focus target</button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { getOptions } from '../../getParam'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { useCombobox } from '../../../../../../src/combos/useCombobox'
import { names } from '@alexvipond/mulago-foundation-portfolio'

const combobox = useCombobox(getOptions())
const label = useElementApi({ identifies: true })

const options = names.slice(0, 10)

const validity = computed(() => {
  return options.includes(combobox.textbox.text.string) ? 'valid' : 'invalid'
})

window.testState =  { combobox }
</script>
