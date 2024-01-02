<template>
  <button ref="element" class="select-none">Press Me</button>
  <pre><code>is.pressed {{ pressing.is.pressed() }}

</code></pre>
  <pre><code>is.released {{ pressing.is.released() }}
event {{ jsonRelease }}
</code></pre>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'

const element = ref()

const pressing = useWithPress(element)
function withoutSequence ({ sequence, ...rest }) {
  return rest
}
// @ts-expect-error
const jsonPress = computed(() => JSON.stringify(withoutSequence(pressing.press.value || {}), null, 2))
// @ts-expect-error
const jsonRelease = computed(() => JSON.stringify(withoutSequence(pressing.release.value || {}), null, 2))

watchEffect(() => console.log(jsonPress.value))
watchEffect(() => console.log(jsonRelease.value))
</script>
