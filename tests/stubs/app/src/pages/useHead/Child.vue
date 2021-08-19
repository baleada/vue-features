<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useHead } from '../../../../../../src/functions'

export default defineComponent({
  setup () {
    const description = ref('stub'),
          metas = [
            { property: 'og:title', content: 'stub' },
            { property: 'og:description', content: description },
          ],
          title = ref('title')
    
    onMounted(() => document.title = 'cachedStub')

    useHead({ title, metas })
  }
})
</script>
