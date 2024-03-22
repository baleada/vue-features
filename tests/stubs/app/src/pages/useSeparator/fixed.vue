<template>
  <!-- focus target -->
  <input type="text" />
  <div class="flex gap-4">
    <div :ref="el1.ref()">baleada</div>
    <div :ref="separator.root.ref({ controls: el1.id.value, label: 'change pane width' })" class="w-1 h-6 bg-blue-600"></div>
    <div ref="el2">vue features</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { useSeparator } from '../../../../../../src/interfaces/useSeparator'

const separator = useSeparator({ kind: 'fixed' })

const el1 = useElementApi({ identifies: true })
const el2 = ref<HTMLElement>()

onMounted(() => {
  watch(
    [separator.position, el1.element, el2],
    () => {
      if(!el1.element.value || !el2.value) return
      el1.element.value.style.width = `${separator.position.value}%`
      el2.value.style.width = `calc(100% - ${separator.position.value}%)`
    },
    { immediate: true, flush: 'post' }
  )
})

window.testState = { separator }
</script>
