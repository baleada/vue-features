<template>
  <section style="background-color: #121212; height: 100vh; width: 100vw;">
    <input type="text" :ref="input.root.ref" />
  </section>
</template>

<script setup lang="ts">
import { readonly } from 'vue'
import { useTextbox } from '../../../../../../src/functions'
import { WithGlobals } from '../../../../../fixtures/types';

const input = readonly(
  useTextbox({ 
    initialValue: 'Baleada: a toolkit for building web apps',
    completesBracketsAndQuotes: true,
  })
);

(window as unknown as WithGlobals).testState =  { input }
</script>
