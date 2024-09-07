<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="(_, index) in presses"
      ref="elements"
      class="p-2 text-purple-900 bg-purple-100 rounded-sm"
    >
      {{ index }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'

onMounted(() => {
  // @ts-expect-error
  window.perf_start = performance.now()
})

const elements = ref([])
const presses = new Array<ReturnType<typeof usePress>>(1000).fill(undefined).map((_, index) => usePress(computed(() => elements.value[index])))

for (const press of presses) {
  watch(
    press.releaseDescriptor,
    () => {
      console.log(press.releaseDescriptor?.value?.kind, (press.releaseDescriptor?.value?.sequence.at(-1).target as HTMLButtonElement).textContent)
    }
  )
}

onMounted(() => {
  // @ts-expect-error
  console.log('presses added effects', performance.now() - window.perf_start)
})
</script>
