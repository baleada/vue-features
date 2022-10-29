<template>
  <a :ref="link.root.getRef()" href="https://www.youtube.com/embed/KpelkMBAD2o">kind of like a dog or something</a>
</template>

<script setup lang="ts">
import { useLink } from '../../../../../../src/interfaces/useLink'

const link = useLink()
</script>
