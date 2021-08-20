<template>
  <section style="background-color: #121212; height: 100vh; width: 100vw;">
    <input type="text" :ref="input.root.ref" />
    <button @click="() => { input.root.element.focus(); input.completeable.selection = { start: 2, end: 4, direction: 'forward' }; }">set selection</button>
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useInput } from '../../../../../../src/functions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const input = reactive(useInput());

    (window as unknown as WithGlobals).testState =  { input }

    return { input }
  }
})
</script>
