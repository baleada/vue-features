<template>
  <!-- focus target -->
  <input type="text" />
  <div class="flex gap-4">
    <div :ref="el1.getRef()">baleada</div>
    <div :ref="separator.root.getRef({ controls: el1.id.value, label: 'change pane width', describedBy: description.id.value })" class="w-1 h-6 bg-blue-600"></div>
    <div ref="el2">vue features</div>
  </div>
  <div :ref="description.getRef()">My special separator</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { useSeparator } from '../../../../../../src/interfaces/useSeparator'

const separator = useSeparator({ kind: 'variable' })

const el1 = useElementApi({ identifies: true })
const el2 = ref<HTMLElement>()
const description = useElementApi({ identifies: true })

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
</script>
