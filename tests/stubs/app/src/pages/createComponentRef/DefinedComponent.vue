<template>
  <div>
    <span ref="foo">foo</span>
  </div>
</template>

<script lang="ts">
import { shallowRef, defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return { foo: shallowRef(null) }
  }
})
</script>
