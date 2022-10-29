<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div class="flex flex-col gap-8 p-8 pb-10">
    <div :ref="listbox.root.getRef()" class="max-w-md border border-gray-600 rounded">
      <div
        v-for="(option, index) in optionMetadataRef"
        :key="optionMetadataRef[index]"
        :ref="listbox.options.getRef(index, { candidate: optionMetadataRef[index] })"
        class="flex items-center gap-2 p-2"
      >
        <span>{{ option }}</span>
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
              v-show="listbox.is.focused(index)">
              focused
            </span>
            <span class="py-2px px-1 opacity-0">focused</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <span
        v-for="character in listbox.query.split('')"
        class="p-1 rounded bg-gray-800 text-gray-300"
      >
        {{ character }}
      </span>
    </div>

    <button
      class="mr-auto py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
      @click="() => reorder()"
    >
      Shuffle
    </button>
    <button
      class="mr-auto py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
      @click="() => remove()"
    >
      Remove
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createDelete, createReorder } from '@baleada/logic'
import { useListbox } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { interestingOptionMetadata } from './optionMetadata'

const optionMetadataRef = ref(interestingOptionMetadata)

const listbox = reactive(useListbox({
  orientation: 'horizontal',
}));

// Math.floor(Math.random() * optionMetadataRef.value.length)

const reorder = () => {
  const r = createReorder<any>(0, 2)

  optionMetadataRef.value = r(optionMetadataRef.value)
};

const remove = () => {
  const d = createDelete<any>(optionMetadataRef.value.length - 1)

  optionMetadataRef.value = d(optionMetadataRef.value)
}

;(window as unknown as WithGlobals).testState =  {
  listbox,
  reorder,
}
</script>
