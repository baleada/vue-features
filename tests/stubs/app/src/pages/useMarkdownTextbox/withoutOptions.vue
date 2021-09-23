<template>
  <section style="background-color: #121212; height: 100vh; width: 100vw;">
    <textarea :ref="input.root.ref" />
    <button @click="() => { input.root.element.focus(); input.completeable.setSelection({ start: 2, end: 4, direction: 'forward' }); }">set selection</button>
  </section>
</template>

<script lang="ts">
import { defineComponent, readonly } from 'vue'
import { useMarkdownInput } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const input = readonly(useMarkdownInput({
      shortcuts: [
        { event: 'cmd+b', effect: 'bold' },
        { event: 'cmd+1', effect: ({ heading }) => heading({ level: 1 }) },
        { event: 'cmd+.', effect: 'blockquote' },
      ]
    }));

    (window as unknown as WithGlobals).testState =  { input }

    return { input }
  }
})
</script>
