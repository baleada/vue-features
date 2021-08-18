import { ref, computed, isRef, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import { bind } from '../affordances'

export type UseHeadOptions = {
  title?: string | Ref<string>,
  metas?: Record<string, string | Ref<string>>[]
}

export function useHead ({ title: rawTitle, metas = [] }: UseHeadOptions): void {
  const title = ensureRef(rawTitle),
        cachedTitle = ref<string>(),
        metaEls = ref<HTMLMetaElement[]>([])

  onMounted(() => {
    if (title.value) {
      cachedTitle.value = document.title
      // natively creates <title> tag automatically if head doesn't have one
      const effect = () => document.title = title.value
      effect()
      watch(title, effect)
    }

    metas.forEach((_, index) => {
      const el = document.createElement('meta')
      document.head.appendChild(el)
      metaEls.value[index] = el
    })
  })

  metas.forEach((meta, index) => {
    bind({
      target: computed(() => metaEls.value[index]),
      keys: meta,
    })
  })

  onBeforeUnmount(() => {
    if (title.value) {
      document.title = cachedTitle.value
    }

    metaEls.value.forEach(el => document.head.removeChild(el))
  })
}

function ensureRef<Value> (value: Value | Ref<Value>): Ref<Value> {
  return computed(() => isRef<Value>(value) ? value.value : value)
}
