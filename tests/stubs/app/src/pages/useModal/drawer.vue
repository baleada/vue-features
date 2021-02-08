<template>
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
        height: 100%;
        width: 200px;
        position: absolute;
        top: 0;
        left: 0;
        background-color: rebeccapurple;
      "
      :ref="modal.drawer()"
    ></nav>
  </header>
</template>

<script>
export default {
  setup () {
    
  }
}
</script>
