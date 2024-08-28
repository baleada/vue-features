<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="(_, index) in pressablees"
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
const pressablees = new Array<ReturnType<typeof usePress>>(1000).fill(undefined).map((_, index) => usePress(computed(() => elements.value[index])))

for (const pressable of pressablees) {
  watch(
    pressable.releaseDescriptor,
    () => {
      console.log(pressable.releaseDescriptor?.value?.kind, (pressable.releaseDescriptor?.value?.sequence.at(-1).target as HTMLButtonElement).textContent)
    }
  )
}

onMounted(() => {
  // @ts-expect-error
  console.log('pressablees added effects', performance.now() - window.perf_start)
})
</script>
