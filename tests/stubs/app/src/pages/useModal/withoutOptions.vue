<template>
  <button @click="modal.open">Open</button>
  <label :ref="modal.label.ref">Modal</label>
  <div
    :ref="modal.root.ref"
    style="
      height: 100vh;
      width: 100vw;
      position: relative;
      background-color: slate;
    "
  >
    <button
      @click="modal.close.ref"
      name="close modal"
      style="
        height: 100%;
        width: 100%;
        position: absolute;
      "
    ></button>
    <div
      :ref="modal.dialog.ref"
      style="
        position: relative;
        height: 200px;
        width: 200px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50% -50%);
        background-color: rebeccapurple;
      "
    >
      <div>
        <input type="text" :ref="modal.focusable.first()">
      </div>
      <div>
        <input type="text">
      </div>
      <div>
        <input type="text" :ref="modal.focusable.last()">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useModal } from '../../../../../../src/functions/index.js'

export default defineComponent({
  setup () {
    const modal = useModal()

    (window as unknown as WithGlobals).testState =  modal

    return { modal }
  }
})
</script>
