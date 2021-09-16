import { onMounted, watchEffect } from 'vue'
import { useStoreable } from '@baleada/vue-composition'
import { preventEffect } from './scheduleBind'

export type OptionalStoreable<Key extends string> =
  Key extends ReturnType<typeof preventEffect> | '' 
    ? undefined
    : ReturnType<typeof useStoreable>

export function useOptionalStoreable<Key extends string> (
  { key, optOutEffect, optInEffect, getString }: {
    key: Key,
    optOutEffect: () => any,
    optInEffect: (storeable: ReturnType<typeof useStoreable>) => any,
    getString: () => string,
  }
): OptionalStoreable<Key> {
  if (!key || key === preventEffect()) {
    onMounted(optOutEffect)
    return
  }

  const storeable = useStoreable(key)

  onMounted(() => {
    optInEffect(storeable)
    watchEffect(() => storeable.value.store(getString()))
  })

  return storeable as OptionalStoreable<Key>
}
