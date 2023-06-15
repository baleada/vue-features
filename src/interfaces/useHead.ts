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
  const narrowedTitle = narrowTitle(title),
        cachedTitle = ref<string>(),
        titleApi: Head['title'] = useElementApi(),
        metasApi: Head['metas'] = useElementApi({ kind: 'list' })

  onMounted(() => {
    if (narrowedTitle.value) {
      cachedTitle.value = document.title

      const existingTitle = document.querySelector('title')

      if (!existingTitle) {
        const titleElement = document.createElement('title')
        document.head.appendChild(titleElement)
        titleApi.getRef()(titleElement)
      } else {
        titleApi.getRef()(existingTitle)
      }

      watchEffect(() => document.title = narrowedTitle.value)
    }

    const metaElements = []

    for (const meta of metas) {
      const metaElement = document.createElement('meta')
      document.head.appendChild(metaElement)
      metaElements.push(metaElement)
    }

    metasApi.elements.value = metaElements
  })

  for (let index = 0; index < metas.length; index++) {
    bind(
      computed(() => metasApi.elements.value[index]),
      metas[index],
    )
  }

  onBeforeUnmount(() => {
    if (narrowedTitle.value) {
      document.title = cachedTitle.value
    }

    metasApi.elements.value.forEach(el => document.head.removeChild(el))
  })

  return {
    title: titleApi,
    metas: metasApi,
  }
}

function narrowTitle (title: string | Ref<string>): Ref<string> {
  return computed(() => isRef(title) ? title.value : title)
}
