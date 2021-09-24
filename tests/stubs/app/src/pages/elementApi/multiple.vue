<template>
  <span ref="stub0" class="0"></span>
  <span ref="stub1" class="1"></span>
  <span ref="stub2" class="2"></span>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useMultipleElements } from '../../../../../../src/extracted'

export default defineComponent({
  setup () {
    const stub0 = ref(null),
          stub1 = ref(null),
          stub2 = ref(null)

    const multiple = useMultipleElements();

    // @ts-ignore
    (window as unknown as WithGlobals).testState =  { ...multiple, stub0, stub1, stub2 }

    return { stub0, stub1, stub2 }
  }
})
</script>
