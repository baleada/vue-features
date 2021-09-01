<template>
  <span ref="stub" class="stub"></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { bindList } from '../../../../../../src/extracted/bindList'

export default defineComponent({
  setup () {
    const stub = ref(null)

    bindList({
      element: stub,
      list: 'class',
      value: 'red',
      watchSources: [],
    })

    return { stub }
  }
})
</script>
