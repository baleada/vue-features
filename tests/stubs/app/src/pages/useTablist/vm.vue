<template>
  <span>vm</span>
</template>

<script>
import { getCurrentInstance, nextTick } from 'vue'

export default {
  setup () {
    const instance = getCurrentInstance()
    console.log(instance.isMounted)
    
    nextTick(() => console.log(instance.isMounted))

  }
}
</script>
