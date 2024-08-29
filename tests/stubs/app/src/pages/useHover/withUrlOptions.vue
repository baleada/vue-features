<template>
  <div class="">
    <p>Status: <code>{{ hover.status.value }}</code></p>
    <div
      :ref="api.ref()"
      class="w-14 h-14 rounded-xl"
      :class="[
        hover.is.hovered() ? 'bg-gray-800' : 'bg-gray-300',
      ]"
    />
  </div>
</template>

<script setup lang="tsx">
import { useHover } from '../../../../../../src/extensions'
import { useElementApi } from '../../../../../../src/extracted'
import { getOptions } from '../../getParam'

const api = useElementApi()
const hover = useHover(api.element, /** getOptions() */)
</script>
