<template>
  <!-- Input is just a focus target for testing tab navigation -->
  <input type="text" />
  <div :ref="listbox.root.ref">
    <div
      v-for="(option, index) in optionMetadata"
      :key="index"
      :ref="listbox.options.getRef(index)"
      style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem;"
    >
      <span>{{ option }}</span>
      <span v-show="ability[index] === 'disabled'">❌</span>
      <span v-show="listbox.is.active(index)">⭐</span>
      <span v-show="listbox.is.selected(index)">✅</span>
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <div
      v-for="(item, index) in ability"
      :key="index"
      class="flex gap-2"
    >
      <button
        class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
        @click="() => enable(index)">Enable {{ optionMetadataRef[index] }}
      </button>
      <button
        class="py-1 px-2 bg-gray-700 text-gray-100 rounded-sm"
        @click="() => disable(index)">Disable {{ optionMetadataRef[index] }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createReplace } from '@baleada/logic'
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
      enable = (index: number) => ability.value = createReplace<'enabled' | 'disabled'>({ index, item: 'enabled' })(ability.value),
      disable = (index: number) => ability.value = createReplace<'enabled' | 'disabled'>({ index, item: 'disabled' })(ability.value)

const listbox = reactive(useListbox({
  orientation: 'vertical',
  multiselectable: true,
  disabledOptionsReceiveFocus: false,
  ability: {
    get: ({ index }) => ability.value[index],
    watchSources: ability,
  },
}));

(window as unknown as WithGlobals).testState =  { listbox }
</script>
