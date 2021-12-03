<template>
  <span ref="element1"></span>
  <span ref="element2"></span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useEffecteds } from '../../../../../../src/extracted/useEffecteds'
import { createToEffectedStatus } from '../../../../../../src/extracted/createToEffectedStatus'
import { WithGlobals } from '../../../../../fixtures/types'

const element1 = ref(null)
const element2 = ref(null)

const effectedStatus = ref('')

const effecteds = useEffecteds()

const elements = ref([])

const stub = ref(0)

onMounted(() => {
  elements.value = [element1.value, element2.value]

  effecteds.value.clear()

  for (let i = 0; i < elements.value.length; i++) {
    effecteds.value.set(elements.value[i], i)
  }
})

const toEffectedStatus = createToEffectedStatus(effecteds)

watch(
  [elements, stub],
  (current, previous) => {
    effectedStatus.value = toEffectedStatus(current, previous)

    effecteds.value.clear()

    for (let i = 0; i < elements.value.length; i++) {
      effecteds.value.set(elements.value[i], i)
    }
  },
  { flush: 'post' }
);


(window as unknown as WithGlobals).testState = {
  element1,
  element2,
  elements,
  stub,
  effectedStatus,
}
</script>
