<template>
  <span style="font-size: 3rem;" ref="stub">click me</span>
  <code style="font-size: 3rem;">{{ count }}</code>
  <p ref="p">click me too</p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { on } from '../../../../../../src/affordances'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup (props, context) {
    const stub = ref(null),
          p = ref(null),
          count = ref(0)

    on<'click'>({
      element: stub,
      effects: defineEffect => [
        defineEffect(
          'click',
          {
            createEffect: ({ off }) => () => {
              count.value += 1
              off()
            },
          }
        )
      ]
    });

    (window as unknown as WithGlobals).testState =  { update: () => stub.value = p.value }

    return { stub, p, count }
  }
})
</script>
