<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useHead } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const title = ref('Title')
    useHead({ title });
    (window as unknown as WithGlobals).testState =  { title }
  }
})
</script>
