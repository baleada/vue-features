<template>
  <span style="font-size: 3rem;" ref="stub">click me</span>
  <code style="font-size: 3rem;">{{ count }}</code>
  <p ref="p">click me too</p>
</template>

<script lang="ts">
import { ref } from 'vue'
import { on } from '../../../../../../src/affordances'

export default {
  setup (props, context) {
    const stub = ref(null),
          p = ref(null),
          count = ref(0)

    console.log(context)

    on({
      target: stub,
      events: {
        click: {
          targetClosure: ({ off }) => () => {
            count.value += 1
            console.log(count.value)
            off()
          },
        },
      }
    })

    window.TEST = { update: () => stub.value = p.value }

    return { stub, p, count }
  }
}
</script>
