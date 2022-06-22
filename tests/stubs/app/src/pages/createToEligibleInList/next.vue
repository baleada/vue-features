<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useElementApi } from '../../../../../../src/extracted';
import { createToNextEligible } from '../../../../../../src/extracted/createToEligibleInList';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useElementApi({ kind: 'list', identified: true })


;(window as unknown as WithGlobals).testState = {
  list,
  toNextEligible: createToNextEligible({
    list,
    loops: false,
  }),
  toNextEligible_loops: createToNextEligible({
    list,
    loops: true,
  })
}

</script>
