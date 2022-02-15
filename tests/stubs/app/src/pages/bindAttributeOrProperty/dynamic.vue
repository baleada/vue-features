<template>
  <span ref="stub">stub</span>
  <button @click="() => count++">button</button>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

export default defineComponent({
  setup () {
    const stub = ref(null),
          count = ref(0)

    bindAttributeOrProperty({
      elementOrElements: stub,
      key: 'id',
      value: computed(() => `stub-${count.value}`),
      watchSources: [],
    })

    return { stub, count }
  }
})
</script>
