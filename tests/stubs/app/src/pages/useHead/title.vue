<template>
  <span></span>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useHead } from '../../../../../../src/functions/index.js'

export default {
  setup () {
    const title = ref('Title')
    useHead({ title })
    window.TEST = { title }
  }
}
</script>
