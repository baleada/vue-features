<template>
  <div>
    <MyFC :getOk="() => ok" />
  </div>
</template>

<script setup lang="ts">
import { ref, customRef, getCurrentInstance, onBeforeUpdate, onMounted, h, onBeforeUnmount } from 'vue'

const ok = ref(false)

onMounted(() => setInterval(() => {
  console.log(ok.value = !ok.value)
}, 1000))

onBeforeUpdate(() => console.log('update'))

function MyFC({ getOk }) {
  return h(
    'div',
    getOk().toString()
  )
}

MyFC.props = {
  getOk: Function
}
</script>
