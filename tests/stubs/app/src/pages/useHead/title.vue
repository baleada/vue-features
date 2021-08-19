<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useHead } from '../../../../../../src/functions/index.js'

export default defineComponent({
  setup () {
    const title = ref('Title')
    useHead({ title })
    (window as unknown as WithGlobals).testState =  { title }
  }
})
</script>
