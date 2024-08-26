<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="(_, index) in withPresses"
      ref="elements"
      class="p-2 text-purple-900 bg-purple-100 rounded-sm"
    >
      {{ index }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'

onMounted(() => {
  // @ts-expect-error
  window.perf_start = performance.now()
})

const elements = ref([])
const withPresses = new Array<ReturnType<typeof useWithPress>>(1000).fill(undefined).map((_, index) => useWithPress(computed(() => elements.value[index])))

for (const withPress of withPresses) {
  watch(
    withPress.release,
    () => {
      console.log(withPress.release?.value?.pointerType, (withPress.release?.value?.sequence.at(-1).target as HTMLButtonElement).textContent)
    }
  )
}

onMounted(() => {
  // @ts-expect-error
  console.log('withPresses added effects', performance.now() - window.perf_start)
})
</script>
