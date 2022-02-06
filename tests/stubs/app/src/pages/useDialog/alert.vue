<template>
  <div class="flex flex-col gap-10">
    <button :ref="dialog.hasPopup.ref">
      Open dialog
    </button>
    <div v-if="dialog.status.value === 'opened'" :ref="dialog.root.ref">
      <div class="flex flex-col gap-2">
        <span>dialog contents</span>
        <button :ref="dialog.firstFocusable.ref">first focusable</button>
      </div>
      <button 
        @click="() => dialog.close()"
        :ref="dialog.lastFocusable.ref"
      >last focusable</button>
    </div>
    <button>random focusable</button>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '../../../../../../src/interfaces/useDialog'
import { WithGlobals } from '../../../../../fixtures/types';

const dialog = useDialog({ alerts: true });

(window as unknown as WithGlobals).testState= { dialog }
</script>
