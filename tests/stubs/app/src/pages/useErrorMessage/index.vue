<template>
  <input type="text" :ref="textbox.root.getRef()" />
  <span :ref="errorMessage.root.getRef({ validity })">Error message</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useErrorMessage } from '../../../../../../src/extensions/useErrorMessage'
import { useTextbox } from '../../../../../../src/interfaces/useTextbox';
import { WithGlobals } from '../../../../../fixtures/types';

const textbox = useTextbox(),
      errorMessage = useErrorMessage(textbox),
      validity = computed(() => /\d/.test(textbox.text.value.string) ? 'invalid' : 'valid')

window.testState = { textbox, errorMessage }
</script>
