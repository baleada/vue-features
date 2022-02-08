<template>
  <div class="flex flex-col gap-10">
    <button :ref="dialog.hasPopup.ref">has popup</button>
    <div v-if="dialog.status.value === 'opened'" :ref="dialog.root.ref">
      <div class="flex flex-col gap-2">
        <span>dialog contents</span>
        <button :ref="dialog.firstFocusable.ref">first focusable</button>
        <button :ref="stackedDialog.hasPopup.ref">open stacked dialog</button>
      </div>
      <button 
        @click="() => dialog.close()"
        :ref="dialog.lastFocusable.ref"
      >last focusable</button>
    </div>
    <div v-if="stackedDialog.status.value === 'opened'" :ref="stackedDialog.root.ref">
      <div class="flex flex-col gap-2">
        <span>stackedDialog contents</span>
        <button :ref="stackedDialog.firstFocusable.ref">first focusable</button>
      </div>
      <button 
        @click="() => stackedDialog.close()"
        :ref="stackedDialog.lastFocusable.ref"
      >close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '../../../../../../src/interfaces/useDialog'
import { WithGlobals } from '../../../../../fixtures/types';

const dialog = useDialog();
const stackedDialog = useDialog();

(window as unknown as WithGlobals).testState= { dialog }

</script>
