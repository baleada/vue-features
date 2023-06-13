<template>
  <span></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types'

const initialProof = ref(0),
      string = ref('Baleada'),
      { storeable } = useStorage({
        key: 'Baleada Features useStorage',
        initialEffect: () => initialProof.value++,
        getString: () => string.value,
      })

const cleanup = () => {
  storeable.value.remove()
  storeable.value.removeStatus()
}

window.testState = { storeable, initialProof, string, cleanup }
</script>
