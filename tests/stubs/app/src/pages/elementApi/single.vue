<template>
  <span ref="stub"></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useSingleElement } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const stub = ref(null)

    const element = useSingleElement();

    (window as unknown as WithGlobals).testState =  { ...element, stub }

    return { stub }
  }
})
</script>
