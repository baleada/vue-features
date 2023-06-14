<template>
  <label :ref="label.root.getRef()"></label>
  <span ref="stub" id="stub"></span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabel } from '../../../../../../src/extensions'

const stub = ref(null),
      label = useLabel(stub, { bindsHtmlFor: true })

window.testState = { label, labelled: stub }
</script>
