import { ref, onMounted, watchPostEffect } from 'vue'
import type { Ref } from 'vue'
import { useDelayable, useSearchable } from '@baleada/vue-composition'
import { createMap } from '@baleada/logic'
import type { Searchable } from '@baleada/logic'
import type { MultipleIdentifiedElementsApi } from './useElementApi'

export function useQuery ({ elementsApi }: { elementsApi: MultipleIdentifiedElementsApi<HTMLElement> }): {
  query: Ref<string>,
  textContents: Ref<Searchable<string>>,
  type: (character: string) => void,
  search: () => void,
} {
  const query: ReturnType<typeof useQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
        type: ReturnType<typeof useQuery>['type'] = character => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value += character

          eventuallyClear.value.delay()
        },
        textContents: ReturnType<typeof useQuery>['textContents'] = useSearchable<string>([]),
        search: ReturnType<typeof useQuery>['search'] = () => {
          textContents.value.candidates = toTextContents(elementsApi.elements.value)
          textContents.value.search(query.value, { returnMatchData: true, threshold: 0 })
        }

  return { query, textContents, type, search }
}

const toTextContents = createMap<HTMLElement, string>(element => element.textContent)
