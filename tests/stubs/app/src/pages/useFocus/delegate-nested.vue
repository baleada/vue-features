<template>
  <div :ref="outer.ref()">
    <input :ref="inner.ref()" />
  </div>
</template>

<script setup lang="tsx">
import { useFocus } from '../../../../../../src/extensions'
import { useElementApi, delegateFocus } from '../../../../../../src/extracted'

delegateFocus()

const outer = useElementApi()
const outerFocus = useFocus(outer.element)

const inner = useElementApi()
const innerFocus = useFocus(inner.element)

window.testState = {
  outer,
  outerFocus,
  inner,
  innerFocus,
}
</script>
