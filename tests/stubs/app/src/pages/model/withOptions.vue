<template>
  <input type="text" ref="stub" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { model } from '../../../../../../src/affordances/model'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const stub = ref(null),
          modelValue = ref('')

    model(
      stub,
      modelValue,
      {
        key: 'dataValue',
        event: 'change',
      }
    )

    ;(window as unknown as WithGlobals).testState =  { modelValue }

    return { stub }
  }
})
</script>
