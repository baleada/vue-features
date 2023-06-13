<template>
  <input type="checkbox" :ref="checkbox.root.getRef()" />
</template>

<script setup lang="ts">
import { useCheckbox } from '../../../../../../src/interfaces/useCheckbox'
import { WithGlobals } from '../../../../../fixtures/types';

const checkbox = useCheckbox()

window.testState = { checkbox }

</script>
