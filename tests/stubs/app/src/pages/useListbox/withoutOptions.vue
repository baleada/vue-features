<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="listbox.root.ref">
    <div
      v-for="(option, index) in optionMetadata"
      :key="index"
      :ref="listbox.options.getRef(index)"
    >
      {{ option }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useListbox, UseListboxOptions } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { optionMetadata } from './optionMetadata'

const props = defineProps({ orientation: String })

const listbox = reactive(useListbox({ orientation: props.orientation as UseListboxOptions['orientation'] }));

(window as unknown as WithGlobals).testState =  { listbox }
</script>
