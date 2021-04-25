<template>
  <div 
    style="
      height: 100vh;
      width: 100vw;
      position: relative;
      background-color: white;
    "
    :ref="modal.drawerContainer.ref"
  >
    <header
      style="
        height: 100vh;
        width: 100vw;
        position: relative;
        background-color: slate;
      "
      :ref="modal.root.ref"
    >
      <nav
        style="
          height: 50vh;
          width: 100vw;
          position: absolute;
          top: 0;
          left: 0;
          background-color: rebeccapurple;
        "
        :ref="modal.dialog.ref"
      ></nav>
    </header>
  </div>
</template>

<script>
import { readonly } from 'vue'
import { useModal } from '../../../../../../src/functions/index.js'

export default {
  setup () {
    const modal = readonly(useModal({
      initialStatus: 'opened',
      drawer: {
        closesTo: 'top',
        threshold: 20,
        thresholdUnit: 'percent',
      },
      touchdragdrop: {
        onMove: () => {
          modal.dialog.el.style.transform = `translateY(-${modal.percentClosed}%)`
        },
        onEnd: () => {
          modal.dialog.el.style.transform = `translateY(-${modal.percentClosed}%)`
        }
      }
    }))

    window.TEST = { modal }

    return { modal }
  }
}
</script>
