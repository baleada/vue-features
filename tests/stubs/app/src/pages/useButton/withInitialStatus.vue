<template>
  <button :ref="button.root.ref">button</button>
</template>

<script setup lang="ts">
import { useButton } from '../../../../../../src/interfaces/useButton'
import { WithGlobals } from '../../../../../fixtures/types';

const button = useButton({ toggles: true, initialStatus: 'on' })

;(window as unknown as WithGlobals).testState= { button }

</script>
