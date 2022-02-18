<template>
  <div class="p-10 flex gap-6">
    <button :ref="el => els[index] = el" v-for="(num, index) in [0, 1, 2]">
      {{ num }} depiglio
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrackings } from '../../../../../../src/extensions/useFocusTrackings'
import type { WithGlobals } from '../../../../../fixtures/types'

const els = ref([])
const focusTrackings = useFocusTrackings(els);

(window as unknown as WithGlobals).testState = { els, focusTrackings }
</script>
