<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div class="flex flex-col gap-8 p-8 pb-10">
    <div :ref="listbox.root.ref()" class="max-w-md border border-gray-600 rounded select-none">
      <div
        v-for="(option, index) in interestingOptionMetadata"
        :key="interestingOptionMetadata[index]"
        :ref="
          listbox.options.ref(
            index,
            {
              candidate: interestingOptionMetadata[index],
              ability: index < interestingOptionMetadata.length - 1 ? 'enabled' : 'disabled'
            }
          )
        "
        class="flex items-center gap-2 p-2"
        :class="clsx(listbox.is.disabled(index) && 'cursor-not-allowed')"
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
        v-for="character in listbox.query.value.split('')"
        class="p-1 text-gray-300 bg-gray-800 rounded"
      >
        {{ character }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListbox } from '../../../../../../src/interfaces/useListbox'
import { interestingOptionMetadata } from '../useListbox/optionMetadata'
import { createList } from '@baleada/logic';

const clsx = createList()

const listbox = useListbox(JSON.parse(new URLSearchParams(window.location.search).get('options') || '{}'));

window.testState =  { listbox }
</script>
