<template>
  <section style="background-color: #121212; height: 100vh; width: 100vw;">
    <input type="text" :ref="input.element.ref" />
  </section>
</template>

<script>
import { readonly } from 'vue'
import { useInput } from '@src/functions/index.js'

export default {
  setup () {
    const input = readonly(useInput({ 
      initialValue: 'Baleada: a toolkit for building web apps',
      completeable: {
        segment: { 
          from: 'divider',
          to: 'divider',
        }
      }
    }))

    window.TEST = { input }

    return { input }
  }
}
</script>
