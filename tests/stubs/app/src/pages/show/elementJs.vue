<template>
  <span :ref="api.getRef()">stub</span>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { show, defineTransition } from '../../../../../../src/affordances/show'

const api = useElementApi()
const condition = ref(true)
const befored = ref({ enter: false, leave: false })
const actived = ref({ enter: false, leave: false })
const aftered = ref({ enter: false, leave: false })
const canceled = ref({ enter: false, leave: false })

const toggle = () => {
  befored.value = { enter: false, leave: false }
  actived.value = { enter: false, leave: false }
  aftered.value = { enter: false, leave: false }
  canceled.value = { enter: false, leave: false }

  condition.value = !condition.value
}

watchEffect(() => console.log('befored', { ...befored.value }))
watchEffect(() => console.log('actived', { ...actived.value }))
watchEffect(() => console.log('aftered', { ...aftered.value }))
watchEffect(() => console.log('canceled', { ...canceled.value }))

show(
  api.element,
  condition,
  {
    transition: {
      appear: true,
      enter: defineTransition<typeof api.element, 'js'>({
        before: () => {
          befored.value.enter = true
        },
        active: (done) => {
          actived.value.enter = true
          setTimeout(() => done(), 1000)
        },
        after: () => {
          aftered.value.enter = true
        },
        cancel: () => {
          canceled.value.enter = true
        },
      }),
      leave: defineTransition<typeof api.element, 'js'>({
        before: () => {
          befored.value.leave = true
        },
        active: (done) => {
          actived.value.leave = true
          setTimeout(() => done(), 1000)
        },
        after: () => {
          aftered.value.leave = true
        },
        cancel: () => {
          canceled.value.leave = true
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
