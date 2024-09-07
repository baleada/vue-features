<template>
  <div class="">
    <p>Status 1: <code>{{ hover1.status.value }}</code></p>
    <p>Status 2: <code>{{ hover2.status.value }}</code></p>
    <div
      :ref="api1.ref()"
      class="w-14 h-14"
      :class="[
        hover1.is.hovered() ? 'bg-gray-600' : 'bg-gray-300',
      ]"
    >
      <div
        :ref="api2.ref()"
        class="w-12 h-12"
        :class="[
          hover2.is.hovered() ? 'bg-gray-800' : 'bg-gray-400',
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, watch } from 'vue'
import { useHover } from '../../../../../../src/extensions'
import { useElementApi } from '../../../../../../src/extracted'
import { getOptions } from '../../getParam'

const props = defineProps<{
  id?: string
}>()

const api1 = useElementApi()
const hover1 = useHover(api1.element, getOptions())

const api2 = useElementApi()
const hover2 = useHover(api2.element, getOptions())

const count1 = ref(0)
const count2 = ref(0)

watch(
  hover1.firstDescriptor,
  () => {
    count1.value++
  }
)

watch(
  hover2.firstDescriptor,
  () => {
    count2.value++
  }
)

window.testState = {
  ...window.testState,
  [props.id || 'nested']: {
    api1,
    hover1,
    api2,
    hover2,
    count1,
    count2,
  }
}
</script>
