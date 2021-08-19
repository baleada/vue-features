import { ref, computed, isRef, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import { bind } from '../affordances'

export type Head = {
  elements: Ref<HTMLMetaElement[]>,
}

export type UseHeadOptions = {
  title?: string | Ref<string>,
  metas?: Record<string, string | Ref<string>>[]
}

export function useHead ({ title, metas = [] }: UseHeadOptions): Head {
  const ensuredTitle = ensureTitle(title),
        cachedTitle = ref<string>(),
        metaEls = ref<HTMLMetaElement[]>([])

  onMounted(() => {
    if (ensuredTitle.value) {
      cachedTitle.value = document.title
      // natively creates <title> tag automatically if head doesn't have one
      const effect = () => document.title = ensuredTitle.value
      effect()
      watch(ensuredTitle, effect)
    }

    metas.forEach((_, index) => {
      const el = document.createElement('meta')
      document.head.appendChild(el)
      metaEls.value[index] = el
    })
  })

  metas.forEach((meta, index) => {
    bind({
      element: computed(() => metaEls.value[index]),
      values: meta,
    })
  })

  onBeforeUnmount(() => {
    if (ensuredTitle.value) {
      document.title = cachedTitle.value
    }

    metaEls.value.forEach(el => document.head.removeChild(el))
  })

  return {
    elements: metaEls
  }
}

function ensureTitle (title: string | Ref<string>): Ref<string> {
  return computed(() => isRef(title) ? title.value : title)
}
