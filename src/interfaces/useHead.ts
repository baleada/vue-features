import { ref, computed, isRef, watchEffect, onMounted, onScopeDispose } from 'vue'
import type { Ref } from 'vue'
import { bind } from '../affordances'
import { useElementApi, useListApi } from '../extracted'
import type {
  ElementApi,
  ListApi,
  SupportedElement,
} from '../extracted'

export type Head = {
  title: ElementApi<SupportedElement>,
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
        metasApi: Head['metas'] = useListApi()

  onMounted(() => {
    if (narrowedTitle.value) {
      cachedTitle.value = document.title

      const existingTitle = document.querySelector('title')

      if (!existingTitle) {
        const titleElement = document.createElement('title')
        document.head.appendChild(titleElement)
        titleApi.ref()(titleElement)
      } else {
        titleApi.ref()(existingTitle)
      }

      watchEffect(() => document.title = narrowedTitle.value)
    }

    const metaElements = []

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const meta of metas) {
      const metaElement = document.createElement('meta')
      document.head.appendChild(metaElement)
      metaElements.push(metaElement)
    }

    metasApi.list.value = metaElements
  })

  for (let index = 0; index < metas.length; index++) {
    bind(
      computed(() => metasApi.list.value[index]),
      metas[index],
    )
  }

  onScopeDispose(() => {
    if (narrowedTitle.value) {
      document.title = cachedTitle.value
    }

    metasApi.list.value.forEach(el => document.head.removeChild(el))
  })

  return {
    title: titleApi,
    metas: metasApi,
  }
}

function narrowTitle (title: string | Ref<string>): Ref<string> {
  return computed(() => isRef(title) ? title.value : title)
}
