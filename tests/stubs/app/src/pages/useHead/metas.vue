<template>
  <span></span>
</template>

<script>
import { ref } from 'vue'
import { useHead } from '@src/functions/index.js'

export default {
  setup () {
    const description = ref('stub'),
          metas = [
            { property: 'og:title', content: 'stub' },
            { property: 'og:description', content: description },
          ]

    useHead({ metas })

    window.TEST = { description }
  }
}
</script>
