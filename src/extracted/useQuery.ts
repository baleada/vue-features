import { ref } from 'vue'
import type { Ref } from 'vue'
import { useDelayable, useSearchable } from '@baleada/vue-composition'
import { createMap } from '@baleada/logic'
import { sortKind } from 'fast-fuzzy' 
import type { Searchable } from '@baleada/logic'
import type { MultipleIdentifiedElementsApi } from './useElementApi'

export function useQuery (
  { elementsApi, toCandidate }: {
    elementsApi: MultipleIdentifiedElementsApi<HTMLElement>,
    toCandidate: ({ element: HTMLElement, index: number }) => string,
  }
): {
  query: Ref<string>,
  searchable: Ref<Searchable<string>>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const query: ReturnType<typeof useQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
        type: ReturnType<typeof useQuery>['type'] = (character, options = { eventuallyClears: true }) => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value += character

          if (options.eventuallyClears) {
            eventuallyClear.value.delay()
          }
        },
        paste: ReturnType<typeof useQuery>['paste'] = (string, options = { eventuallyClears: true }) => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value = string

          if (options.eventuallyClears) {
            eventuallyClear.value.delay()
          }
        },
        searchable: ReturnType<typeof useQuery>['searchable'] = useSearchable<string>([]),
        search: ReturnType<typeof useQuery>['search'] = () => {
          searchable.value.candidates = toTextContents(elementsApi.elements.value)
          searchable.value.search(query.value, { returnMatchData: true, threshold: 0, sortBy: sortKind.insertOrder })
        },
        toTextContents = createMap<HTMLElement, string>((element, index) => toCandidate({ element, index }))

  return { query, searchable, type, paste, search }
}
