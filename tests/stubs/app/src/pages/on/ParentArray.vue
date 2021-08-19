<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.getRef(index)"
  >
    {{ counts[index] }}
  </span>
  <ChildArray
    v-if="childArrayIsMounted"
    :els="els"
    :counts="counts"
    :setCounts="setCounts"
  />
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeUpdate } from 'vue'
import ChildArray from './ChildArray.vue'
import { createReplace } from '@baleada/logic'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  components: {
    ChildArray,
  },
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            getRef: index => el => els.value[index] = el 
          }),
          counts = ref(stubs.data.map(() => 0)),
          setCounts = index => {
            console.log(index)
            counts.value = createReplace({ index, item: counts.value[index] + 1 })(counts.value)
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    const childArrayIsMounted = ref(false);

    (window as unknown as WithGlobals).testState =  {
      mount: () => childArrayIsMounted.value = true,
      counts,
    }

    return { els, stubs, counts, setCounts, childArrayIsMounted }
  }
})
</script>
