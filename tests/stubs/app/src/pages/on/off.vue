<template>
  <section style="font-size: 3rem;" :ref="api.getRef()">click me</section>
  <code style="font-size: 3rem;">{{ count }}</code>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { on } from '../../../../../../src/affordances'

const api = useElementApi(),
      count = ref(0)

on(
  api.element,
  {
    click: { 
      createEffect: (zero, { off }) => () => {
          count.value += 1
          off()
      }
    }
  }
)

window.testState =  { count }
</script>
