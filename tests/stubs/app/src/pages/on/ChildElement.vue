<template>
  <!-- Element to wait for, so mounting can be proven -->
  <article></article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { on } from '../../../../../../src/affordances/on'

const props = defineProps<{ element: HTMLElement, count: number, setCount: (num: number) => void }>()

on(
  ref(props.element),
  {
    click () {
      props.setCount(props.count + 1)
    }
  }
)
</script>
