<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div class="flex flex-col gap-8 p-8 pb-10">
    <div :ref="listbox.root.ref()" class="max-w-md border border-gray-600 rounded select-none">
      <div
        v-for="(option, index) in optionMetadataRef"
        :key="optionMetadataRef[index]"
        :ref="listbox.options.ref(index, { candidate: optionMetadataRef[index] })"
        class="flex items-center gap-2 p-2"
      >
        <span>{{ option }}</span>
        <div class="flex gap-2 ml-auto">
          <div class="relative text-xs tracking-widest uppercase">
            <span
              class="absolute inset-0 px-1 text-green-200 bg-green-700 rounded py-2px"
              v-show="listbox.is.selected(index)">
              selected
            </span>
            <span class="px-1 opacity-0 py-2px">selected</span>
          </div>
          <div class="relative text-xs tracking-widest uppercase">
            <span
              class="absolute inset-0 px-1 text-blue-200 bg-blue-700 rounded py-2px"
              v-show="listbox.is.focused(index)">
              focused
            </span>
            <span class="px-1 opacity-0 py-2px">focused</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <span
        v-for="character in listbox.query.split('')"
        class="p-1 text-gray-300 bg-gray-800 rounded"
      >
        {{ character }}
      </span>
    </div>

    <button
      class="px-2 py-1 mr-auto text-gray-100 bg-gray-700 rounded-sm"
      @click="() => reorder()"
    >
      Shuffle
    </button>
    <button
      class="px-2 py-1 mr-auto text-gray-100 bg-gray-700 rounded-sm"
      @click="() => remove()"
    >
      Remove
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createRemove, createReorder } from '@baleada/logic'
import { useListbox } from '../../../../../../src/interfaces/useListbox'
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
  const remove = createRemove<any>(optionMetadataRef.value.length - 1)

  optionMetadataRef.value = remove(optionMetadataRef.value)
}

window.testState =  {
  listbox,
  reorder,
}
</script>
