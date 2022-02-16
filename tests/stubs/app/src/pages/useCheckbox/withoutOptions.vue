<template>
  <input type="checkbox" :ref="checkbox.root.ref" />
</template>

<script setup lang="ts">
import { useCheckbox } from '../../../../../../src/interfaces/useCheckbox'
import { WithGlobals } from '../../../../../fixtures/types';

const checkbox = useCheckbox();

(window as unknown as WithGlobals).testState = { checkbox }

</script>
