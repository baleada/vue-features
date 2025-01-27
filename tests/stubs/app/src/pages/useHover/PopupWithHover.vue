<template>
  <div class="">
    <p>Status 1: <code>{{ hover1.status.value }}</code></p>
    <div class="relative">
      <div
        tabindex="0"
        :ref="api1.ref()"
        class="w-14 h-14"
        :class="[
          hover1.is.hovered() ? 'bg-gray-600' : 'bg-gray-300',
        ]"
      >
      </div>
      <div
        v-if="count1"
        id="popup"
        :ref="api2.ref()"
        class="absolute inset-0 w-14 h-14 bg-blue-100"
      />
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, watch } from 'vue'
import { useHover } from '../../../../../../src/extensions/useHover'
import { useElementApi } from '../../../../../../src/extracted'
import { getOptions } from '../../getParam'

const api1 = useElementApi()
const hover1 = useHover(api1.element, getOptions())

const api2 = useElementApi()
useHover(api2.element, getOptions())

const count1 = ref(0)

watch(
  hover1.firstDescriptor,
  () => {
    count1.value++
  }
)

window.testState = {
  api1,
  hover1,
  api2,
  count1,
}
</script>
