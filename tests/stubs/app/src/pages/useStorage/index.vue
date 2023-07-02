<template>
  <span ref="el"></span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStorage } from '../../../../../../src/extracted'

const initialProof = ref(0),
      el = ref<HTMLElement>(),
      string = ref('Baleada'),
      { storeable } = useStorage(
        el,
        'Baleada Features useStorage',
        () => initialProof.value++,
        () => string.value,
      )

const cleanup = () => {
  storeable.value.remove()
  storeable.value.removeStatus()
}

window.testState = { storeable, initialProof, string, cleanup }
</script>
