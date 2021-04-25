<template>
  <section style="background-color: #121212; height: 100vh; width: 100vw;">
    <input type="text" :ref="input.element.ref" />
    <button @click="() => { input.element.el.focus(); input.completeable.setSelection({ start: 2, end: 4, direction: 'forward' }); }">set selection</button>
  </section>
</template>

<script>
import { readonly } from 'vue'
import { useInput } from '../../../../../../src/functions/index.js'

export default {
  setup () {
    const input = readonly(useInput())

    window.TEST = { input }

    return { input }
  }
}
</script>
