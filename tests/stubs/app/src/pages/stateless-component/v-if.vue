<template>
  <MyComponent :getCount="() => count" />
</template>

<script setup lang="tsx">
import { ref, onBeforeUpdate, onMounted, h } from 'vue'

const count = ref(0)

onMounted(() => {
  setInterval(() => {
    console.log(count.value++)
  }, 1000)
})

onBeforeUpdate(() => {
  console.log('update')
})

function MyComponent({ getCount }) {
  return h(
    'div',
    [
      `${getCount()}`
    ]
  )
}
</script>
