<template>
  <span :ref="api.ref()">stub</span>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { show, defineTransition } from '../../../../../../src/affordances/show'

const api = useElementApi()
const condition = ref(true)
const started = ref({
  enter: false,
  leave: false,
})
const ended = ref({
  enter: false,
  leave: false,
})
const canceled = ref({
  enter: false,
  leave: false,
})

const toggle = () => {
  started.value = {
    enter: false,
    leave: false,
  }
  ended.value = {
    enter: false,
    leave: false,
  }
  canceled.value = {
    enter: false,
    leave: false,
  }

  condition.value = !condition.value
}

watchEffect(() => console.log('started', { ...started.value }))
watchEffect(() => console.log('ended', { ...ended.value }))
watchEffect(() => console.log('canceled', { ...canceled.value }))

show(
  api.element,
  condition,
  {
    transition: {
      appear: true,
      enter: defineTransition<typeof api.element, 'css'>({
        from: 'enter-from',
        active: 'enter-active',
        to: 'enter-to',
        start: () => started.value.enter = true,
        end: () => ended.value.enter = true,
        cancel: () => canceled.value.enter = true,
      }),
      leave: defineTransition<typeof api.element, 'css'>({
        from: 'leave-from',
        active: 'leave-active',
        to: 'leave-to',
        start: () => started.value.leave = true,
        end: () => ended.value.leave = true,
        cancel: () => canceled.value.leave = true,
      }),
    }
  }
)

window.testState =  {
  api,
  condition,
  ended,
  canceled,
  toggle,
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
