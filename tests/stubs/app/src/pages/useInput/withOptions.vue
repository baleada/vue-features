<template>
  <section style="background-color: #121212; height: 100vh; width: 100vw;">
    <input type="text" :ref="input.root.ref" />
  </section>
</template>

<script lang="ts">
import { defineComponent, readonly } from 'vue'
import { useInput } from '../../../../../../src/functions'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const input = readonly(useInput({ 
      initialValue: 'Baleada: a toolkit for building web apps',
      completeable: {
        segment: { 
          from: 'divider',
          to: 'divider',
        }
      }
    }));

    (window as unknown as WithGlobals).testState =  { input }

    return { input }
  }
})
</script>
