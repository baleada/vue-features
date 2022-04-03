<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div class="flex flex-col gap-8 p-8 pb-10">
    <div :ref="listbox.root.ref" class="max-w-md border border-gray-600 rounded">
      <div
        v-for="(option, index) in optionMetadataRef"
        :key="optionMetadataRef[index]"
        :ref="listbox.options.getRef(index)"
        class="flex items-center gap-2 p-2 select-none"
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
          <div class="relative text-xs uppercase tracking-widest">
            <span
              class="absolute inset-0 py-2px px-1 rounded bg-red-700 text-red-200"
              v-show="ability[index] === 'disabled'">
              disabled
            </span>
            <span class="py-2px px-1 opacity-0">disabled</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div
        v-for="(item, index) in ability"
        :key="index"
        class="flex gap-2"
      >
        <span>{{ optionMetadataRef[index] }}:</span>
        <button
          class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
          :class="{ 'bg-yellow-800 text-yellow-400': ability[index] === 'enabled' }"
          @click="() => enable(index)"
        >
          Enabled
        </button>
        <button
          class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
          :class="{ 'bg-yellow-800 text-yellow-400': ability[index] === 'disabled' }"
          @click="() => disable(index)"
        >
          Disabled
        </button>
      </div>
    </div>

    <button
      class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
      @click="() => reorder(4)"
    >
      Shuffle
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createReplace, createReorder } from '@baleada/logic'
import { useListbox } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { optionMetadata } from './optionMetadata'

const optionMetadataRef = ref(optionMetadata)

const ability = ref<('enabled' | 'disabled')[]>([
        'enabled',
        'disabled',
        'enabled',
        'enabled',
        'disabled',
        'enabled',
      ]),
      enable = (index: number) => ability.value = createReplace<'enabled' | 'disabled'>(index, 'enabled')(ability.value),
      disable = (index: number) => ability.value = createReplace<'enabled' | 'disabled'>(index, 'disabled')(ability.value)

const listbox = reactive(useListbox({
  orientation: 'vertical',
  multiselectable: true,
  disabledOptionsReceiveFocus: false,
  selectsOnFocus: true,
  ability: {
    get: index => ability.value[index],
    watchSource: ability,
  },
}));

const reorder = (iterations: number) => {
  const r = createReorder<any>(
    Math.floor(Math.random() * optionMetadataRef.value.length),
    Math.floor(Math.random() * optionMetadataRef.value.length),
  )

  optionMetadataRef.value = r(optionMetadataRef.value)
  ability.value = r(ability.value)

  reorder(iterations - 1)
}

;(window as unknown as WithGlobals).testState =  {
  listbox,
  ability,
  enable,
  disable,
  reorder,
}
</script>
