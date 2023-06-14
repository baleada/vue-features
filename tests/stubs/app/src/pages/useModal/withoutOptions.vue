<template>
  <div class="flex flex-col gap-10">
    <button :ref="modal.button.root.getRef()">has popup</button>
    <div v-if="modal.dialog.rendering.is.rendered()" :ref="modal.dialog.root.getRef()">
      <div class="flex flex-col gap-2">
        <span>modal contents</span>
        <button>first focusable</button>
        <button :ref="stackedModal.button.root.getRef()">open stacked modal</button>
      </div>
      <button 
        @click="() => modal.dialog.close()"
      >last focusable</button>
    </div>
    <div v-if="stackedModal.dialog.rendering.is.rendered()" :ref="stackedModal.dialog.root.getRef()">
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
