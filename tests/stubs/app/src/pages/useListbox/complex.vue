<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div class="flex flex-col gap-8 p-8 pb-10">
    <div :ref="listbox.root.ref" class="max-w-md border border-gray-600 rounded">
      <div
        v-for="(option, index) in optionMetadataRef"
        :key="optionMetadataRef[index]"
        :ref="listbox.options.getRef(index)"
        class="flex items-center gap-2 p-2"
      >
        <h2 :ref="labels.roots.getRef(index)">{{ option.title }}</h2>
        <p :ref="descriptions.roots.getRef(index)">{{ option.description }}</p>
        <div class="ml-auto flex gap-2">
          <div class="relative text-xs uppercase tracking-widest">
            <span
              class="absolute inset-0 py-2px px-1 rounded bg-green-700 text-green-200"
              v-show="listbox.is.selected(index)">
              selected
            </span>
            <span class="py-2px px-1 opacity-0">selected</span>
          </div>
          <div class="relative text-xs uppercase tracking-widest">
            <span
              class="absolute inset-0 py-2px px-1 rounded bg-blue-700 text-blue-200"
              v-show="listbox.is.active(index)">
              active
            </span>
            <span class="py-2px px-1 opacity-0">active</span>
          </div>
        </div>
      </div>
    </div>

    <button
      class="mr-auto py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
      @click="() => reorder(3)"
    >
      Shuffle
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createReplace, createReorder } from '@baleada/logic'
import { useLabels, useDescriptions } from '../../../../../../src/extensions'
import { useListbox } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { optionMetadata } from './optionMetadata'

const optionMetadataRef = ref(optionMetadata.map(option => ({ title: option, description: `Description of ${option}` })))

const listbox = reactive(useListbox({
  orientation: 'vertical',
}));

const labels = useLabels(listbox.options.elements);
const descriptions = useDescriptions(listbox.options.elements);

(window as unknown as WithGlobals).testState =  {
  listbox,
}
</script>
