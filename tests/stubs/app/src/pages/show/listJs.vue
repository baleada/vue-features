<template>
  <span
    v-for="num in nums"
    :class="`${num}`"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { show, defineTransition } from '../../../../../../src/affordances/show'
import { createReplace } from '@baleada/logic'
import type { WithGlobals } from '../../../../../fixtures/types';

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' })

const condition = ref(true)
const befored = ref(nums.value.map(() => false))
const actived = ref(nums.value.map(() => false))
const aftered = ref(nums.value.map(() => false))
const canceled = ref(nums.value.map(() => false))

const toggle = () => {
  befored.value = nums.value.map(() => false)
  actived.value = nums.value.map(() => false)
  aftered.value = nums.value.map(() => false)
  canceled.value = nums.value.map(() => false)

  condition.value = !condition.value
}

watchEffect(() => console.log('befored', befored.value ))
watchEffect(() => console.log('actived', actived.value ))
watchEffect(() => console.log('aftered', aftered.value ))
watchEffect(() => console.log('canceled', canceled.value ))

show(
  api.elements,
  condition,
  {
    transition: {
      enter: defineTransition<typeof api.elements, 'js'>({
        before: (index) => {
          befored.value = createReplace(index, true)(befored.value)
        },
        active: (index, done) => {
          actived.value = createReplace(index, true)(actived.value)
          setTimeout(() => done(), 1000)
        },
        after: (index) => {
          aftered.value = createReplace(index, true)(aftered.value)
        },
        cancel: (index) => {
          canceled.value = createReplace(index, true)(canceled.value)
        },
      }),
      leave: defineTransition<typeof api.elements, 'js'>({
        before: (index) => {
          befored.value = createReplace(index, true)(befored.value)
        },
        active: (index, done) => {
          actived.value = createReplace(index, true)(actived.value)
          setTimeout(() => done(), 1000)
        },
        after: (index) => {
          aftered.value = createReplace(index, true)(aftered.value)
        },
        cancel: (index) => {
          canceled.value = createReplace(index, true)(canceled.value)
        },
      }),
    }
  }
)

;(window as unknown as WithGlobals).testState =  {
  api,
  condition,
  befored,
  actived,
  aftered,
  canceled,
  toggle,
}
</script>
