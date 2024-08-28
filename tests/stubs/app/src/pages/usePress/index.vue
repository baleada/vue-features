<template>
  <button ref="element" class="select-none">Press Me</button>
  <pre><code>is.pressed {{ pressable.is.pressed() }}

</code></pre>
  <pre><code>is.released {{ pressable.is.released() }}
event {{ jsonRelease }}
</code></pre>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'

const element = ref()

const pressable = usePress(element)
function withoutSequence ({ sequence, ...rest }) {
  return rest
}
// @ts-expect-error
const jsonPress = computed(() => JSON.stringify(withoutSequence(pressable.descriptor.value || {}), null, 2))
// @ts-expect-error
const jsonRelease = computed(() => JSON.stringify(withoutSequence(pressable.release.value || {}), null, 2))

watchEffect(() => console.log(jsonPress.value))
watchEffect(() => console.log(jsonRelease.value))
</script>
