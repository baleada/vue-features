<template>
  <div class="flex flex-col gap-10">
    <button :ref="modal.button.root.ref()">has popup</button>
    <div v-if="!modal.dialog.is.removed()" :ref="modal.dialog.root.ref()">
      <div class="flex flex-col gap-2">
        <button>first focusable</button>
        <button :ref="select.button.root.ref()">Select stuff</button>
        <div
          v-if="!select.listbox.is.removed()"
          :ref="select.listbox.root.ref()"
          class="flex flex-col max-w-md"
        >
          <div
            v-for="(option, index) in optionMetadata"
            :ref="select.listbox.options.ref(index)"
            class="p-2 outline-0 ring-0 border-0"
          >
            {{ option }}
          </div>
        </div>
      </div>
      <button @click="() => modal.dialog.close()">last focusable</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { optionMetadata } from '../useListbox/optionMetadata'
import { useModal } from '../../../../../../src/combos/useModal'
import { useSelect } from '../../../../../../src/combos/useSelect'

const modal = useModal(),
      select = useSelect()

window.testState = { modal, select }
</script>
