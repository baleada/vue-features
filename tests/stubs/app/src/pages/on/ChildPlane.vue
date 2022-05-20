<template>
  <!-- Element to wait for, so mounting can be proven -->
  <article></article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { on } from '../../../../../../src/affordances/on'
import type { Plane } from '../../../../../../src/extracted/ensureReactivePlane'

const props = defineProps<{
  elements: Plane<HTMLElement>,
  setRow: (num: number) => void,
  setColumn: (num: number) => void,
}>()

on(
  ref(props.elements),
  {
    click: {
      createEffect: (row, column) => () => {
        props.setRow(row)
        props.setColumn(column)
      }
    }
  }
)
</script>
