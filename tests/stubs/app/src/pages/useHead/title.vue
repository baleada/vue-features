<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useHead } from '../../../../../../src/interfaces'

export default defineComponent({
  setup () {
    const title = ref('Title')
    useHead({ title })
    window.testState =  { title }
  }
})
</script>
