import { onMounted, watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'

export type WithStoreable = {
  storeable?: ReturnType<typeof useStoreable>
}

export function scheduleOptionalStore (
  { storeable, optOutEffect, optInEffect, getString }: {
    storeable: undefined | ReturnType<typeof useStoreable>,
    optOutEffect: () => any,
    optInEffect: (storeable: ReturnType<typeof useStoreable>) => any,
    getString: () => string,
  }
) {
  if (storeable === undefined) {
    onMounted(optOutEffect)
    return
  }

  onMounted(() => {
    optInEffect(storeable)
    watchEffect(() => storeable.value.store(getString()))
  })
}
