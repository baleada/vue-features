<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="(button, index) in buttons"
      :ref="button.root.getRef()"
      class="p-2 bg-purple-100 text-purple-900 rounded-sm"
    >
      {{ index }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useButton } from '../../../../../../src/interfaces/useButton'
import { WithGlobals } from '../../../../../fixtures/types';

onMounted(() => {
  // @ts-expect-error
  window.perf_start = performance.now()
})

// @ts-expect-error
const buttons = new Array<ReturnType<typeof useButton<false>>>(1000).fill(undefined).map(() => useButton())

for (const button of buttons) {
  watch(
    button.event,
    () => {
      console.log(button.event?.value?.type, (button.event?.value?.target as HTMLButtonElement).textContent)
    }
  )
}

onMounted(() => {
  // @ts-expect-error
  console.log('buttons added effects', performance.now() - window.perf_start)
})
</script>
