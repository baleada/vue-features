<template>
  <div class="flex flex-col gap-10">
    <button :ref="modal.button.root.ref()">
      Open modal
    </button>
    <div :ref="modal.dialog.root.ref()">
      <div class="flex flex-col gap-2">
        <span>modal contents</span>
        <button>first focusable</button>
      </div>
      <button 
        @click="() => modal.dialog.close()"
      >last focusable</button>
    </div>
    <button>random focusable</button>
  </div>
</template>

<script setup lang="ts">
import { useModal } from '../../../../../../src/combos/useModal'

const modal = useModal({ alerts: true })

window.testState = { modal }
</script>
