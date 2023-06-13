<template>
  <button ref="element" class="select-none">Press Me</button>
  <pre><code>is.pressed {{ pressState.is.pressed() }}
event {{ jsonPress }}
</code></pre>
  <pre><code>is.released {{ pressState.is.released() }}
event {{ jsonRelease }}
</code></pre>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { usePressState } from '../../../../../../src/extensions/usePressState'

const element = ref()

const pressState = usePressState(element)
function withoutSequence ({ sequence, ...rest }) {
  return rest
}
const jsonPress = computed(() => JSON.stringify(withoutSequence(pressState.press.value || {}), null, 2))
const jsonRelease = computed(() => JSON.stringify(withoutSequence(pressState.release.value || {}), null, 2))

watchEffect(() => console.log(jsonPress.value))
watchEffect(() => console.log(jsonRelease.value))
</script>
