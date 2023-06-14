<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="(row, rowIndex) in rows">
      <section
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.getRef(rowIndex, columnIndex)"
      >{{ `${row},${column}` }}</section>
    </template>
  </div>
  <button @click="() => (childIsMounted = !childIsMounted)">button</button>
  <ChildPlane
    v-if="childIsMounted"
    :elements="api.elements.value"
    :setRow="val => row = val"
    :setColumn="val => column = val"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import ChildPlane from './ChildPlane.vue'

const rows = ref([0, 1]),
      columns = ref([0, 1, 2])

const api = useElementApi({ kind: 'plane' }),
      row = ref(0),
      column = ref(0),
      childIsMounted = ref(false)

window.testState =  { childIsMounted, row, column }
</script>
