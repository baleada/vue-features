<template>
  <div class="">
    <p>Status 1: <code>{{ press1.status.value }}</code></p>
    <div class="relative">
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
import { usePress } from '../../../../../../src/extensions/usePress'
import { useElementApi } from '../../../../../../src/extracted'
import { getOptions } from '../../getParam'

const api1 = useElementApi()
const press1 = usePress(api1.element, getOptions())

const api2 = useElementApi()

const count1 = ref(0)

watch(
  press1.firstDescriptor,
  () => {
    count1.value++
  }
)

window.testState = {
  api1,
  press1,
  api2,
  count1,
}
</script>
