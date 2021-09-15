import { onMounted, watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import { preventEffect } from './scheduleBind'

export function useOptionalStoreable (
  { key, optOutEffect, optInEffect, getString }: {
    key: string,
    optOutEffect: (storeable: ReturnType<typeof useStoreable>) => any,
    optInEffect: (storeable: ReturnType<typeof useStoreable>) => any,
    getString: () => string,
  }
) {
  const storeable = useStoreable(key)

  // You didn't see anything...
  if (!key || key === preventEffect()) {
    onMounted(() => {
      storeable.value.remove()
      storeable.value.removeStatus()
    })
  }

  if (!key || key === preventEffect()) {
    onMounted(() => optOutEffect(storeable))
  } else {
    onMounted(() => optInEffect(storeable))
  }

  if (key && key !== preventEffect()) {
    onMounted(() => {
      watchEffect(() => storeable.value.store(getString()))
    })
  }

  return storeable
}

