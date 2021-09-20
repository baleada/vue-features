<template>
  <span></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import { scheduleOptionalStore } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types'

const optInProof = ref(0),
      string = ref('Baleada'),
      storeable = useStoreable('baleadaFeaturesOptionalStoreable')

scheduleOptionalStore({
  storeable,
  optOutEffect: () => {},
  optInEffect: () => optInProof.value++,
  getString: () => string.value,
});

const cleanup = () => {
  storeable.value.remove()
  storeable.value.removeStatus()
}

(window as unknown as WithGlobals).testState = { storeable, optInProof, string, cleanup }
</script>
