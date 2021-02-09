<template>
  <button @click="modal.open">Open</button>
  <label :ref="modal.label()">Modal</label>
  <div
    :ref="modal.root()"
    style="
      height: 100vh;
      width: 100vw;
      position: relative;
      background-color: slate;
    "
  >
    <button
      @click="modal.close"
      name="close modal"
      style="
        height: 100%;
        width: 100%;
        position: absolute;
      "
    ></button>
    <div
      :ref="modal.dialog()"
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

<script>
import { useModal } from '@src/functions/index.js'

export default {
  setup () {
    const modal = useModal()

    window.TEST = modal

    return { modal }
  }
}
</script>
