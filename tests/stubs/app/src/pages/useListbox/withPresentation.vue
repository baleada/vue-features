<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <ul :ref="listbox.root.getRef()" class="flex flex-col gap-6 p-6">
    <li
      v-for="({ section, options }, sectionIndex) in withSections"
      :key="section"
      class="flex flex-col gap-2"
      role="presentation"
    >
      <span :id="section" class="text-sm uppercase font-extrabold tracking-widest">{{ section }}</span>
      <ul :ariaLabelledBy="section" role="group" class="flex flex-col gap-2 pl-4">
        <li
          v-for="(option, optionIndex) in options"
          :key="option"
          :ref="listbox.options.getRef(sectionIndex * 2 + optionIndex)"
          class="flex items-center gap-2 padding-2"
        >
          <span>{{ option }}</span>
          <span v-show="listbox.is.focused(sectionIndex * 2 + optionIndex)">⭐</span>
          <span v-show="listbox.is.selected(sectionIndex * 2 + optionIndex)">✅</span>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useListbox } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { optionMetadata } from './optionMetadata'

const withSections = ref([
  {
    section: 'Section 1',
    options: optionMetadata.slice(0, 2),
  },
  {
    section: 'Section 2',
    options: optionMetadata.slice(2, 4),
  },
  {
    section: 'Section 3',
    options: optionMetadata.slice(4, 6),
  },
])

const listbox = reactive(useListbox({
  orientation: 'vertical',
  multiselectable: true,
}))

;(window as unknown as WithGlobals).testState =  { listbox }
</script>
