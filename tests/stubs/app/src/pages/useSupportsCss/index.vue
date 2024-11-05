<template>
  <div></div>
</template>

<script setup lang="tsx">
import { useSupportsCss } from '../../../../../../src/extracted/useSupportsCss';

window.testState = {
  supportsBackgroundColor: useSupportsCss('background-color: inherit'),
  supportsFooBar: useSupportsCss('foo: bar')
}
</script>
