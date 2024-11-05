<template>
  <div class="">
    <p>Status 1: <code>{{ press1.status.value }}</code></p>
    <p>Duration 1: {{ press1.descriptor.value?.metadata.duration }} </p>
    <p>Status 2: <code>{{ press2.status.value }}</code></p>
    <div
      tabindex="0"
      :ref="api1.ref()"
      class="w-14 h-14"
      :class="[
        press1.is.pressed() ? 'bg-gray-600' : 'bg-gray-300',
      ]"
    >
    </div>
    <div
      tabindex="0"
      :ref="api2.ref()"
      class="w-12 h-12"
      :class="[
        press2.is.pressed() ? 'bg-gray-800' : 'bg-gray-400',
      ]"
    />
  </div>
</template>

<script setup lang="tsx">
import { ref, watch } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'
import { useElementApi } from '../../../../../../src/extracted'
import { getOptions } from '../../getParam'

const props = defineProps<{
  id?: string
}>()

const api1 = useElementApi()
const press1 = usePress(api1.element, getOptions())

const api2 = useElementApi()
const press2 = usePress(api2.element, getOptions())

const count1 = ref(0)
const count2 = ref(0)

watch(
  press1.firstDescriptor,
  () => {
    count1.value++
  }
)

watch(
  press2.firstDescriptor,
  () => {
    count2.value++
  }
)

window.testState = {
  ...window.testState,
  [props.id || 'nested']: {
    api1,
    press1,
    api2,
    press2,
    count1,
    count2,
  }
}
</script>
