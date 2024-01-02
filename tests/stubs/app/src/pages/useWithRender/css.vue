<template>
  <span
    v-if="conditionalRendering.is.rendered()"
    :ref="api.ref()"
  >stub</span>
  <section>{{ conditionalRendering.status.value }}</section>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { useWithRender } from '../../../../../../src/extensions/useWithRender'
import { defineTransition } from '../../../../../../src/affordances/show'

const api = useElementApi()
const conditionalRendering = useWithRender(
  api.element,
  {
    initialRenders: true,
    show: {
      transition: {
        appear: true,
        enter: defineTransition<typeof api.element, 'css'>({
          from: 'enter-from',
          active: 'enter-active',
          to: 'enter-to',
        }),
        leave: defineTransition<typeof api.element, 'css'>({
          from: 'leave-from',
          active: 'leave-active',
          to: 'leave-to',
        }),
      }
    }
  }
)

window.testState =  {
  conditionalRendering,
}
</script>

<style>
.enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.enter-active {
  transition: all 2s ease-in-out;
}

.enter-to {
  opacity: 1;
  transform: scale(1);
}

.leave-from {
  opacity: 1;
}

.leave-active {
  transition: all 2s ease-in-out;
}

.leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
