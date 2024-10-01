<template>
  <input :ref="input.ref()" />
  <pre><code>{{ inputFocus.status.value }}</code></pre>
  <pre><code>{{ inputFocus.target.value }}</code></pre>
  <pre><code>{{ inputFocus.visibility.value }}</code></pre>
  
  <button :ref="button.ref()">Click me</button>
  <pre><code>{{ buttonFocus.status.value }}</code></pre>
  <pre><code>{{ buttonFocus.target.value }}</code></pre>
  <pre><code>{{ buttonFocus.visibility.value }}</code></pre>
  
  <div :ref="div.ref()">
    <input />
  </div>
  <pre><code>{{ divFocus.status.value }}</code></pre>
  <pre><code>{{ divFocus.target.value }}</code></pre>
  <pre><code>{{ divFocus.visibility.value }}</code></pre>

</template>

<script setup lang="tsx">
import { useFocus } from '../../../../../../src/extensions/useFocus'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'

const input = useElementApi()
const button = useElementApi()
const div = useElementApi()

const inputFocus = useFocus(input.element)
const buttonFocus = useFocus(button.element)
const divFocus = useFocus(div.element)

window.testState = {
  input,
  div,
  inputFocus,
  buttonFocus,
  divFocus,
}
</script>
