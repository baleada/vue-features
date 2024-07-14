<template>
  <button ref="element" class="select-none">Press Me</button>
  <pre><code>is.pressed {{ withPress.is.pressed() }}

</code></pre>
  <pre><code>is.released {{ withPress.is.released() }}
event {{ jsonRelease }}
</code></pre>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'

const element = ref()

const withPress = useWithPress(element)
function withoutSequence ({ sequence, ...rest }) {
  return rest
}
// @ts-expect-error
const jsonPress = computed(() => JSON.stringify(withoutSequence(withPress.press.value || {}), null, 2))
// @ts-expect-error
const jsonRelease = computed(() => JSON.stringify(withoutSequence(withPress.release.value || {}), null, 2))

watchEffect(() => console.log(jsonPress.value))
watchEffect(() => console.log(jsonRelease.value))
</script>
