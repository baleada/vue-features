<template>
  <section>
    <input type="text" :ref="input.root.ref()" />
  </section>
</template>

<script setup lang="ts">
import { readonly } from 'vue'
import { useTextbox } from '../../../../../../src/interfaces'

const input = readonly(
  useTextbox({ 
    initialValue: 'Baleada: a toolkit for building web apps',
    completesBracketsAndQuotes: true,
    storeableKey: 'baleadaFeaturesTextbox',
  })
)

window.testState =  { input }
</script>
