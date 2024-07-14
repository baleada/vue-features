<template>
  <div class="w-screen h-screen flex items-center justify-center bg-gray-100 text-gray-900">
    <div class="w-full max-w-md flex flex-col gap-8 p-10 rounded-lg bg-white shadow-md">
      <div ref="scrollable" class="w-full h-10 overflow-y-scroll">
        <div class="w-full h-64 flex flex-col justify-center">
          <div ref="element" class="w-4 h-4 bg-emerald-300"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getOptions } from '../../getParam'
import { virtualFocusTarget } from '../../../../../../src/affordances/virtualFocusTarget'

const scrollable = ref()
const element = ref<HTMLElement>()
const isFocused = ref(false)

console.log(getOptions());


virtualFocusTarget({
  focusedElement: computed(() => (
    isFocused.value ? element.value : null
  ) as HTMLElement)
}, getOptions())

window.testState =  {
  scrollable,
  element,
  virtuallyFocus: () => isFocused.value = true
}
</script>
