<template>
  <div className="w-screen h-screen bg-gradient-to-r from-sky-400 to-indigo-500 p-12 rounded-lg flex items-center justify-center">
    <SystemModal :modal="modal">
      <template #button>
        <!--
          Instead of this one-off button, I'd use a properly abstracted `SystemButton` component
          that takes a `button` prop, where I can pass `modal.button`.
        -->
        <button
          :ref="modal.button.root.ref()"
          class="
            inline-flex items-center justify-center
            rounded-md bg-black bg-opacity-20 bg-clip-padding
            border border-white/20 px-3.5 py-2
            font-medium font-[inherit] text-base text-white
            hover:bg-opacity-30 active:bg-opacity-40
            transition-colors cursor-default
            outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          Delete...
        </button>
      </template>
      <template #contents>
        <h2
          className="text-xxl font-semibold leading-6 my-0 text-slate-700"
        >
          Delete folder
        </h2>
        <p className="mt-3 text-slate-500">
          Are you sure you want to delete "Documents"? All contents
          will be permanently destroyed.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-3.5 py-2 rounded bg-slate-200 text-slate-800 hover:border-slate-300 active:bg-slate-300"
            @click="modal.dialog.close"
          >
            Cancel
          </button>
          <button
            className="px-3.5 py-2 rounded bg-red-500 text-white hover:border-red-600 active:bg-red-600"
            @click="modal.dialog.close"
          >
            Delete
          </button>
        </div>
      </template>
    </SystemModal>
  </div>
</template>

<script setup lang="tsx">
import SystemModal from './SystemModal.vue'
import { useModal } from '../../../../../../src/combos/useModal'

const modal = useModal()
</script>
