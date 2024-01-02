<template>
  <span
    v-for="num in nums"
    :class="`${num}`"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { show, defineTransition } from '../../../../../../src/affordances/show'
import { createReplace } from '@baleada/logic'

const nums = ref([0, 1, 2])
const api = useListApi()

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
  api.list,
  condition,
  {
    transition: {
      enter: defineTransition<typeof api.list, 'js'>({
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
      leave: defineTransition<typeof api.list, 'js'>({
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

window.testState =  {
  api,
  condition,
  befored,
  actived,
  aftered,
  canceled,
  toggle,
}
</script>
