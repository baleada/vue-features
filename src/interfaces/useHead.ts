import { ref, computed, isRef, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import { bind } from '../affordances'
import { useElementApi } from '../extracted'
import type {
  ElementApi,
  ListApi,
} from '../extracted'

export type Head = {
  title: ElementApi<HTMLElement>,
  metas: ListApi<HTMLMetaElement>,
}

export type UseHeadOptions = {
  title?: string | Ref<string>,
  metas?: Record<string, string | Ref<string>>[]
}

export function useHead ({ title, metas = [] }: UseHeadOptions): Head {
  const ensuredTitle = ensureTitle(title),
        cachedTitle = ref<string>(),
        titleApi: Head['title'] = useElementApi(),
        metasApi: Head['metas'] = useElementApi({ kind: 'list' })

  onMounted(() => {
    if (ensuredTitle.value) {
      cachedTitle.value = document.title

      const existingTitle = document.querySelector('title')

      if (!existingTitle) {
        const titleElement = document.createElement('title')
        document.head.appendChild(titleElement)
        titleApi.ref(titleElement)
      } else {
        titleApi.ref(existingTitle)
      }

      watchEffect(() => document.title = ensuredTitle.value)
    }

    metas.forEach((_, index) => {
      const metaElement = document.createElement('meta')
      document.head.appendChild(metaElement)
      metasApi.getRef(index)(metaElement)
    })
  })

  metas.forEach((meta, index) => {
    bind(
      computed(() => metasApi.elements.value[index]),
      meta,
    )
  })

  onBeforeUnmount(() => {
    if (ensuredTitle.value) {
      document.title = cachedTitle.value
    }

    metasApi.elements.value.forEach(el => document.head.removeChild(el))
  })

  return {
    title: titleApi,
    metas: metasApi,
  }
}

function ensureTitle (title: string | Ref<string>): Ref<string> {
  return computed(() => isRef(title) ? title.value : title)
}
