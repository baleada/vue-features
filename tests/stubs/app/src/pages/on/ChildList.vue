<template>
  <!-- Element to wait for, so mounting can be proven -->
  <article></article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { on } from '../../../../../../src/affordances/on'

const props = defineProps<{ elements: HTMLElement[], setIndex: (num: number) => void }>()

on(
  ref(props.elements),
  {
    click: {
      createEffect: index => () => {
        props.setIndex(index)
      }
    }
  }
)
</script>
