<template>
  <span
    v-for="(stub, index) in stubs.data"
    :key="stub"
    :ref="stubs.ref(index)"
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

<script>
import { ref, reactive, onBeforeUpdate } from 'vue'
import ChildArray from './ChildArray.vue'
import { useReplaceable } from '@baleada/vue-composition'

export default {
  components: {
    ChildArray,
  },
  setup () {
    const els = ref([]),
          stubs = reactive({
            data: [0, 1, 2],
            ref: index => el => els.value[index] = el 
          }),
          counts = ref(stubs.data.map(() => 0)),
          setCounts = index => {
            counts.value = useReplaceable(counts.value).value.replace({ index, item: counts.value[index] + 1 })
          }
    
    onBeforeUpdate(() => {
      els.value = []
    })

    const childArrayIsMounted = ref(false)

    window.TEST = {
      mount: () => childArrayIsMounted.value = true,
      counts,
    }

    return { els, stubs, counts, setCounts, childArrayIsMounted }
  }
}
</script>
