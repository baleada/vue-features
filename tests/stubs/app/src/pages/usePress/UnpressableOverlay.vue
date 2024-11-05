<template>
  <div class="">
    <p>Status 1: <code>{{ underlayPress.status.value }}</code></p>
    <p>Duration 1: {{ underlayPress.descriptor.value?.metadata.duration }} </p>
    <div
      tabindex="0"
      :ref="underlay.ref()"
      class="fixed inset-0 h-screen w-screen"
    >
    </div>
    <div
      tabindex="0"
      :ref="overlay.ref()"
      class="fixed bottom-0 left-0 right-0 h-[calc(100vh/2)] w-screen"
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

const underlay = useElementApi()
const underlayPress = usePress(underlay.element, getOptions())

const overlay = useElementApi()

const count1 = ref(0)

watch(
  underlayPress.firstDescriptor,
  () => {
    count1.value++
  }
)

window.testState = {
  underlay,
  underlayPress,
  overlay,
  count1,
}
</script>
