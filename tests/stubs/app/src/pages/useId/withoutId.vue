<template>
  <span ref="stub" />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useId } from '../../../../../../src/util'

export default defineComponent({
  setup () {
    const stub = ref(null),
          id = useId({ element: stub })

    onMounted(() => (window as unknown as WithGlobals).testState =  { id })

    return {
      stub,
    }
  }
})
</script>
