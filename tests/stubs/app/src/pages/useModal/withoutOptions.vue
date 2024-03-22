<template>
  <div class="flex flex-col gap-10">
    <button :ref="modal.button.root.ref()">has popup</button>
    <div v-if="!modal.dialog.is.removed()" :ref="modal.dialog.root.ref()">
      <div class="flex flex-col gap-2">
        <span>modal contents</span>
        <button>first focusable</button>
        <button :ref="stackedModal.button.root.ref()">open stacked modal</button>
      </div>
      <button 
        @click="() => modal.dialog.close()"
      >last focusable</button>
    </div>
    <div v-if="!stackedModal.dialog.is.removed()" :ref="stackedModal.dialog.root.ref()">
      <div class="flex flex-col gap-2">
        <span>stackedModal contents</span>
        <button>first focusable</button>
      </div>
      <button 
        @click="() => stackedModal.dialog.close()"
      >close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModal } from '../../../../../../src/combos/useModal'

const modal = useModal();
const stackedModal = useModal()

window.testState = { modal }

</script>
