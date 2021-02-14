<template>
  <div 
    style="
      height: 100vh;
      width: 100vw;
      position: relative;
      background-color: white;
    "
    :ref="modal.drawerContainer()"
  >
    <header
      style="
        height: 100vh;
        width: 100vw;
        position: relative;
        background-color: slate;
      "
      :ref="modal.root()"
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
        :ref="modal.dialog()"
      ></nav>
    </header>
  </div>
</template>

<script>
import { useModal } from '@src/functions/index.js'

export default {
  setup () {
    const modal = useModal({
      initialStatus: 'opened',
      drawer: {
        closesTo: 'top',
        threshold: 20,
        thresholdUnit: 'percent',
      }
    })

    window.TEST = { modal }

    return { modal }
  }
}
</script>
