<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.getRef(index)"
  >
    {{ stub }}
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeUpdate } from 'vue'
import { show } from '../../../../../../src/affordances'
import { WithGlobals } from '../../../../../fixtures/types';

export default defineComponent({
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            getRef: index => el => els.value[index] = el 
          }),
          conditions = ref([
            true,
            true,
            true,
          ]),
          toggle = index => { conditions.value[index] = !conditions.value[index]; updates.value++ },
          updates = ref(0)
    
    onBeforeUpdate(() => {
      els.value = []
    })

    show({
      element: els,
      condition: {
        getValue: ({ index }) => conditions.value[index],
        watchSources: updates,
      },
    });

    (window as unknown as WithGlobals).testState =  { toggle }

    return {
      stubs,
    }
  }
})
</script>
