<template>
  <!--
    No scoped slot needed, because the parent component has access to `modal`
    (return value of `useModal`), and it can use that to call methods like `open`
  -->
  <slot name="button"></slot>
  <Teleport to="body">
    <Transition
      :appear="true"
      enter-active-class="animate-in ease-out duration-300"
      leave-active-class="animate-out ease-in duration-200"
    >
      <div
        v-if="!modal.dialog.is.removed()"
        class="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur"
      >
        <div
          :ref="modal.dialog.root.ref()"
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
        >
          <!--
            Again, no scoped slot needed, because the parent component defining this slot has access to `modal`.
          -->
          <slot name="contents"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="tsx">
import { Teleport } from 'vue'
import type { Modal } from '../../../../../../src/combos/useModal'

const { modal } = defineProps<{
  modal: Modal
}>()

</script>
