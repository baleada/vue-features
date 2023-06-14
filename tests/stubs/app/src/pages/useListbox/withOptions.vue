<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="listbox.root.getRef()">
    <div
      v-for="(option, index) in optionMetadata"
      :key="index"
      :ref="listbox.options.getRef(index)"
      style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem;"
    >
      <span>{{ option }}</span>
      <span v-show="listbox.is.focused(index)">⭐</span>
      <span v-show="listbox.is.selected(index)">✅</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useListbox, UseListboxOptions } from '../../../../../../src/interfaces'
import { optionMetadata } from './optionMetadata'

const listbox = reactive(useListbox({
  needsAriaOwns: true,
}))

window.testState =  { listbox }
</script>
