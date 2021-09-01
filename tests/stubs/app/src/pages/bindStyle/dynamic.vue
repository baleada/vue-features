<template>
  <span ref="stub"></span>
  <button @click="() => (color = 'blue')"></button>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

export default defineComponent({
  setup () {
    const stub = ref(null),
          color = ref('red')

    bindStyle({
      element: stub,
      property: 'backgroundColor',
      value: color,
      watchSources: [],
    })

    return { stub, color }
  }
})
</script>
