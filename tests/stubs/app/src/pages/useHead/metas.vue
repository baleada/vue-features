<template>
  <span></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '../../../../../../src/interfaces'

const description = ref('stub'),
      metas = [
        { property: 'og:title', content: 'stub' },
        { property: 'og:description', content: description },
      ]

useHead({ metas })

window.testState =  { description }
</script>
