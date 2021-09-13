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
          modelValue = ref('')

    model({
      element: stub,
      modelValue,
    });

    (window as unknown as WithGlobals).testState =  { modelValue }

    return { stub }
  }
})
</script>
