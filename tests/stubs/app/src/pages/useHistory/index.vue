<template>
  <div></div>
</template>

<script setup lang="ts">
import { useHistory } from '../../../../../../src/extracted/useHistory'

const history = useHistory()

window.testState = { history }
</script>
