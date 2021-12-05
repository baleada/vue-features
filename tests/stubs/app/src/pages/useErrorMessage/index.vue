<template>
  <input type="text" :ref="textbox.root.ref" />
  <span :ref="errorMessage.root.ref">Error message</span>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useErrorMessage } from '../../../../../../src/extensions/useErrorMessage'
import { useTextbox } from '../../../../../../src/interfaces/useTextbox';
import { WithGlobals } from '../../../../../fixtures/types';

const textbox = useTextbox(),
      validity = ref<'valid' | 'invalid'>('valid'),
      errorMessage = useErrorMessage(textbox, { validity })

watchEffect(() => validity.value = /\d/.test(textbox.text.value.string) ? 'invalid' : 'valid');

(window as unknown as WithGlobals).testState = { textbox, errorMessage, validity }
</script>
