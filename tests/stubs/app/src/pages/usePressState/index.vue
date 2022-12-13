<template>
  <button ref="element">Press Me</button>
  <pre><code>is.pressed {{ pressState.is.pressed() }}
event {{ jsonEvent }}
{{ count }}</code></pre>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { usePressState } from '../../../../../../src/extensions/usePressState'

const element = ref()
const count = ref(0)

const pressState = usePressState(element)

const jsonEvent = computed(() => JSON.stringify(pressState.event.value, null, 2))

watchEffect(() => console.log(jsonEvent.value))
</script>
