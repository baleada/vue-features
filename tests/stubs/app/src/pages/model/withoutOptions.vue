<template>
  <input type="text" ref="stub" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { model } from '../../../../../../src/affordances'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const stub = ref(null),
          value = ref('')

    model({
      element: stub,
      value,
    });

    (window as unknown as WithGlobals).testState =  { value }

    return { stub }
  }
})
</script>
