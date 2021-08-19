<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useHead } from '../../../../../../src/functions'
import { WithGlobals } from '../../../../../fixtures/types.js';

export default defineComponent({
  setup () {
    const description = ref('stub'),
          metas = [
            { property: 'og:title', content: 'stub' },
            { property: 'og:description', content: description },
          ]

    useHead({ metas });

    (window as unknown as WithGlobals).testState =  { description }
  }
})
</script>
