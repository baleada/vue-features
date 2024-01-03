<template>
  <span
    v-for="(item, index) in items"
    :ref="api.ref(index, { candidate: index === 1 ? '' : item.candidate })"
  >
    <span>{{ item.title }}: </span><span>{{ item.candidate }}</span>
  </span>
</template>

<script setup lang="ts">
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { useListQuery } from '../../../../../../src/extracted/useListQuery'

const items = [
  { title: 'Item 1', candidate: 'e' },
  { title: 'Item 2', candidate: 'f' },
  { title: 'Item 3', candidate: 'g' },
]
const api = useListApi({
  identifies: true,
  defaultMeta: { candidate: '' }
})
const listQuery = useListQuery({ api })

window.testState =  { listQuery }
</script>
