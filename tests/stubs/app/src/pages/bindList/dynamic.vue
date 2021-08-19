<template>
  <span ref="stub" class="stub"></span>
  <button @click="() => (color = 'blue')"></button>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bindList } from '../../../../../../src/affordances/bindList'

export default defineComponent({
  setup () {
    const stub = ref(null),
          color = ref('red')

    bindList({
      element: stub,
      list: 'class',
      value: color,
      watchSources: [],
    })

    return { stub, color }
  }
})
</script>
