<template>
  <div class="flex flex-col gap-10">
    <button :ref="modal.button.root.getRef()">has popup</button>
    <div v-if="modal.dialogRendering.is.rendered()" :ref="modal.dialog.root.getRef()">
      <div class="flex flex-col gap-2">
        <span>modal contents</span>
        <button :ref="modal.dialog.firstFocusable.getRef()">first focusable</button>
        <button :ref="stackedModal.button.root.getRef()">open stacked modal</button>
      </div>
      <button 
        @click="() => modal.dialog.close()"
        :ref="modal.dialog.lastFocusable.getRef()"
      >last focusable</button>
    </div>
    <div v-if="stackedModal.dialogRendering.is.rendered()" :ref="stackedModal.dialog.root.getRef()">
      <div class="flex flex-col gap-2">
        <span>stackedModal contents</span>
        <button :ref="stackedModal.dialog.firstFocusable.getRef()">first focusable</button>
      </div>
      <button 
        @click="() => stackedModal.dialog.close()"
        :ref="stackedModal.dialog.lastFocusable.getRef()"
      >close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModal } from '../../../../../../src/combos/useModal'
import { WithGlobals } from '../../../../../fixtures/types';

const modal = useModal();
const stackedModal = useModal()

window.testState= { modal }

</script>
