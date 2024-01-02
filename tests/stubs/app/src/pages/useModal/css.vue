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
import { defineTransition } from '../../../../../../src/affordances/show'
import { useModal } from '../../../../../../src/combos/useModal'

const modal = useModal({
  transition: {
    dialog: element => ({
      appear: true,
      enter: defineTransition<typeof element, 'css'>({
        from: 'enter-from',
        active: 'enter-active',
        to: 'enter-to',
      }),
      leave: defineTransition<typeof element, 'css'>({
        from: 'leave-from',
        active: 'leave-active',
        to: 'leave-to',
      }),
    }),
  }
});
const stackedModal = useModal({
  transition: {
    dialog: element => ({
      appear: true,
      enter: defineTransition<typeof element, 'css'>({
        from: 'enter-from',
        active: 'enter-active',
        to: 'enter-to',
      }),
      leave: defineTransition<typeof element, 'css'>({
        from: 'leave-from',
        active: 'leave-active',
        to: 'leave-to',
      }),
    }),
  }
})

window.testState = { modal }

</script>

<style>
.enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.enter-active {
  transition: all 2s ease-in-out;
}

.enter-to {
  opacity: 1;
  transform: scale(1);
}

.leave-from {
  opacity: 1;
}

.leave-active {
  transition: all 2s ease-in-out;
}

.leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
