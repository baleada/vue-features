<template>
  <input type="text" :ref="textbox.root.ref" />
  <span :ref="errorMessage.root.ref">Error message</span>
</template>

<script setup lang="ts">
import { useErrorMessage } from '../../../../../../src/extensions/useErrorMessage'
import { useTextbox } from '../../../../../../src/interfaces/useTextbox';
import { WithGlobals } from '../../../../../fixtures/types';

const textbox = useTextbox(),
      errorMessage = useErrorMessage(textbox, {
        validity: {
          get: () => /\d/.test(textbox.text.value.string) ? 'invalid' : 'valid',
          watchSource: () => textbox.text.value.string,
        }
      })

;(window as unknown as WithGlobals).testState = { textbox, errorMessage }
</script>
