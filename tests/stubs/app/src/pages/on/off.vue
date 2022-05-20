<template>
  <section style="font-size: 3rem;" :ref="api.ref">click me</section>
  <code style="font-size: 3rem;">{{ count }}</code>
  <p ref="p">click me too</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import type { WithGlobals } from '../../../../../fixtures/types';
import { on } from '../../../../../../src/affordances'

const api = useElementApi(),
      p = ref(null),
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

;(window as unknown as WithGlobals).testState =  { update: () => api.element.value = p.value }
</script>
