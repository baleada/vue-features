<template>
  <span :ref="withRoot.root.ref">useIntersection</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useInterface } from '../../../../../../src/interfaces'
import { useIntersection } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types'

export default defineComponent({
  setup () {
    const withRoot = useInterface<HTMLHtmlElement>(),
          intersection = useIntersection(withRoot);

    (window as unknown as WithGlobals).testState = { intersection}
    
    return { withRoot }
  }
})
</script>
