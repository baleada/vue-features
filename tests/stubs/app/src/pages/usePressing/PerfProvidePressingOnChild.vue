<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="(_, index) in pressings"
      ref="elements"
      class="p-2 text-purple-900 bg-purple-100 rounded-sm"
    >
      {{ index }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed } from 'vue'
import { usePressing } from '../../../../../../src/extensions/usePressing'

onMounted(() => {
  // @ts-expect-error
  window.perf_start = performance.now()
})

const elements = ref([])
const pressings = new Array<ReturnType<typeof usePressing>>(1000).fill(undefined).map((_, index) => usePressing(computed(() => elements.value[index])))

for (const pressing of pressings) {
  watch(
    pressing.release,
    () => {
      console.log(pressing.release?.value?.pointerType, (pressing.release?.value?.sequence.at(-1).target as HTMLButtonElement).textContent)
    }
  )
}

onMounted(() => {
  // @ts-expect-error
  console.log('pressings added effects', performance.now() - window.perf_start)
})
</script>
